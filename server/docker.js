import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import {docker, problem, timer, sapporo} from '../imports/api/db.js';
import {resultCompare, allInOneCommand} from '../imports/library/docker.js';
import { logReason, logRequest } from '../imports/library/logger.js';

import Dockerode from 'dockerode';
import Future from 'fibers/future';
import stream from 'stream';

import {updateProblem} from './userData.js';

let concurrentCount = [];

Meteor.startup(() => {
    Meteor.methods({
        'docker.add'(data) {
            if (Meteor.user().username !== 'admin') return;
            if (data._id) {
                docker.update({
                    _id: data._id
                }, {
                    $set: data
                });
            } else {
                docker.insert(data);
            }
        },
        'docker.remove'(data) {
            if (Meteor.user().username !== 'admin') return;
            docker.remove({
                _id: data._id
            }, (err) => {
                if (err) {
                    alert(err);
                }
            });
        }
    });

    if ( (docker.find({global: true}).fetch()).length === 0 ) {
        docker.insert({
            global: true,
            ip: 'localhost',
            timeout: 3,
            port: ''
        });
    }

    //Checking Docker
    Meteor.methods({
        'docker.listImage'() {
            let future = new Future();
            let testDocker = getDockerInstance();
            testDocker.listImages({}, (err, data) => {
                if (err) {
                    future.throw('cannot connect to Docker');
                    return;
                } else {
                    future.return(data);
                }
            });
            return future.wait();
        },
        'docker.checkImage'() {
            let future = new Future();
            //let dockerConfig = docker.findOne({global: true});
            let dockerLangs = docker.find({languages: true}).fetch();
            if (dockerLangs.length === 0) {
                throw new Meteor.Error(500, 'No Programming Language Configuration');
            }
            let testDocker = getDockerInstance();
            testDocker.listImages({}, (err, data) => {
                if (err) {
                    future.throw('cannot connect to Docker');
                    return;
                }
                let images = data.map((image)=>{
                    return image.RepoTags[0];
                });
                let result = dockerLangs.map((lang)=>{
                    for (var key in images) {
                        if (lang.image === images[key]) {
                            return {
                                image: lang.image,
                                find: true
                            };
                        }
                    }
                    return {
                        image: lang.image,
                        find: false
                    };
                });
                future.return(result);
            });
            return future.wait();
        },
        'docker.testImage'(){
            //let dockerConfig = docker.findOne({global: true});
            let dockerLangs = docker.find({languages: true}).fetch();
            let testDocker = getDockerInstance();
            let result = [];
            for (var key in dockerLangs) {
                result.push({
                    title  : dockerLangs[key].title,
                    output : dockerTest(testDocker, dockerLangs[key])
                });
            }
            return result;
        },
        'docker.submitCode'(data, isTest){
            //let dockerConfig = docker.findOne({docker: true});
            let dockerLangs = docker.find({languages: true}).fetch();
            let problemData = problem.findOne({_id:data.problemID});
            let _docker = getDockerInstance();
            let langObj = null;
            for (var key in dockerLangs) {
                if (dockerLangs[key].title === data.language) {
                    langObj = dockerLangs[key];
                }
            }
            if (!langObj) {
                logRequest(logReason.noLang);
                throw new Meteor.Error(500, 'No Programming Language Found');
            }
            let output = {
                pass: false,
                stdout: null
            };
            if (isTest) {
                let testInput = problemData.testInput;
                output.stdout = userSubmit(_docker, data, langObj, testInput);
                output.pass   = resultCompare(output.stdout, problemData.testOutput);
                output.expected = problemData.testOutput;
                output.testInput = problemData.testInput;
            } else {
                if (!((timer.findOne({timeSync: true})).coding)) {
                    logRequest(logReason.gameStop);
                    throw new Meteor.Error(500, 'Game has stopped');
                }
                let success = true;
                for (key in problemData.verfication) {
                    let output = userSubmit(_docker, data, langObj, problemData.verfication[key].input);
                    if (!resultCompare(output, problemData.verfication[key].output)) {
                        success = false;
                        break;
                    }
                }
                output.stdout = null;
                output.pass = success;
                updateProblem(data.user._id, data.problemID, success, data.code);
            }

            logRequest((typeof(output.stdout) === 'string')? logReason.success:logReason.resultNotStr, output.stdout);
            return output;
        },
        'docker.performanceTest'(data) {
            let lang = docker.findOne({_id:data.langType});
            let _docker = getDockerInstance();
            let test_result = userSubmit(_docker, data, lang, data.input);
            logRequest((typeof(test_result) === 'string')? logReason.success:logReason.resultNotStr, test_result);
            return test_result;
        }
    });
});

const getTimeOutValue = function (isMSecond) {
    let timeout = (sapporo.findOne({sapporo:true})).timeout;
    if (isNaN(timeout) || (timeout <= 0)) {
        timeout = 60;
    }
    if (isMSecond) {
        timeout = timeout*1000;
    }
    return timeout;
};

const getDockerInstance = function() {
    let dockerGlobalConfig = docker.findOne({global: true});
    if (!dockerGlobalConfig.ip || dockerGlobalConfig.ip === '') {
        let dockerSocket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
        return new Dockerode({
            socketPath: dockerSocket,
            timeout: getTimeOutValue(true) + 3000 //3 seconds as a buffer time for container to stop itself
        });
    } else {
        return new Dockerode({
            host: dockerGlobalConfig.ip,
            port: dockerGlobalConfig.port,
            timeout: getTimeOutValue(true) + 3000
        });
    }
};

const reachMax = function (id) {
    let sapporoObj = (sapporo.findOne({sapporo:true}));
    if (concurrentCount.length > sapporoObj.maxExe) {
        //console.log('reach MAX');
        return true;
    } else {
        concurrentCount.push(id);
        //console.log(concurrentCount.length);
        return false;
    }
};
const releaseConcurrent = function (id) {
    for (let key in concurrentCount) {
        if (concurrentCount[key] === id) {
            concurrentCount = concurrentCount.splice(key, 1);
            //console.log('Removed: ' + id);
            break;
        }
    }
};

const dockerTest = function (dockerObj, lang) {
    let uniqueID = Random.id();
    if (reachMax(uniqueID)) {
        throw new Meteor.Error(503, 'Server reached maximum executions. Please try again later.');
    }
    let test = allInOneCommand(lang, lang.helloworld, lang.testInput, getTimeOutValue(false));
    let result = dockerRun(dockerObj, lang.image, test);
    releaseConcurrent(uniqueID);
    return result;
};
const userSubmit = function (_docker, data, langObj, testInput) {
    let uniqueID = Random.id();
    if (reachMax(uniqueID)) {
        logRequest(logReason.reachMaxmimum);
        throw new Meteor.Error(503, 'Server reached maximum executions. Please try again later.');
    }
    let command = allInOneCommand(langObj, data.code, testInput, getTimeOutValue(false));
    let result = dockerRun(_docker, langObj.image, command);
    releaseConcurrent(uniqueID);
    return result;
};

const dockerRun = function (dockerObj, image, command) {
    let future = new Future();
    let stdout = stream.Writable();
    let stderr = stream.Writable();
    let output = '';
    let err    = '';
    let tooLong = false;
    stdout._write = function (chunk, encoding, done) {
        if (output.length < 100000) {
            output = output + chunk.toString();
        } else {
            tooLong = true;
        }
        done();
    };
    stderr._write = function (chunk, encoding, done) {
        err = err + chunk.toString();
        done();
    };
    let inputCommand = '';
    for (var key in command) {
        var space = '';
        if (key!==0) space = ' ';
        inputCommand = inputCommand + space + command[key];
    }
    //console.log(inputCommand);
    dockerObj.run(image, ['/bin/bash', '-c', inputCommand], [stdout, stderr], {Tty:false}, (error, data, container) => {
        if (err !== '') {
            future.return(err);
        } else if (error) {
            future.return(error);
        } else if (tooLong) {
            future.return('Reject: Output exceeds maximum length');
        } else {
            future.return(output);
        }
        //let container = dockerObj.getContainer(containerID);

        //docker rm `docker ps --no-trunc -aq`
        containerCleanUp(container);
    });
    return future.wait();
};

const containerCleanUp = function (container) {
    container.inspect((err, data)=> {
        if (err) {
            console.log(err);
        } else if (data && data.State) {
            let state = data.State;
            if (state.Status && (state.Status === 'exited')) {
                container.remove((err)=> {
                    if (err) {
                        containerCleanUp(container);
                    }
                });
            } else {
                setTimeout(()=> {
                    containerCleanUp(container);
                }, 500);
            }
        }
    });
};
