import { Meteor } from 'meteor/meteor';

import {docker, problem, timer, sapporo} from '../imports/api/db.js';
import {resultCompare, allInOneCommand} from '../imports/library/docker.js';
import Dockerode from 'dockerode';
import Future from 'fibers/future';
import stream from 'stream';

import {updateProblem} from './userData.js';

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
            return output;
        },
        'docker.performanceTest'(data) {
            let lang = docker.findOne({_id:data.langType});
            //console.log(lang);
            let _docker = getDockerInstance();
            let test_result = userSubmit(_docker, data, lang, data.input);

            //let test_result = data;
            // let sleep = function (ms) {
            //     return new Promise(resolve => setTimeout(resolve, ms));
            // }
            //var sleepMS = (Math.random() * 5000);
            //console.log("Sleep for " + String(sleepMS));
            //await sleep(sleepMS);
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

const dockerTest = function (dockerObj, lang) {
    //let localTestFolder = createTestingFile(lang);

    let test = allInOneCommand(lang, lang.helloworld, lang.testInput, getTimeOutValue(false));
    let result = dockerRun(dockerObj, lang.image, test);
    return result;
};
const userSubmit = function (_docker, data, langObj, testInput) {
    //let localTestFolder = createUserFile(data, langObj, testInput);
    let command = allInOneCommand(langObj, data.code, testInput, getTimeOutValue(false));
    let result = dockerRun(_docker, langObj.image, command);
    return result;
};

const cleanUpContainer = function (containerObj) {
    if (containerObj && containerObj.remove) {
        containerObj.remove(function (rmErr) {
            if (rmErr) {
                console.log('wait 1sec to clean up container again');
                setTimeout(()=>{
                    cleanUpContainer(containerObj);
                }, 1000);
            }
        });
    }
};

const dockerRun = function (dockerObj, image, command) {
    let future = new Future();
    let stdout = stream.Writable();
    let stderr = stream.Writable();
    let output = '';
    let err    = '';
    stdout._write = function (chunk, encoding, done) {
        output = output + chunk.toString();
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
    dockerObj.run(image, ['/bin/bash', '-c', inputCommand], [stdout, stderr], {Tty:false}, (error, data, containerID) => {
        /* if (containerID && containerID.id) {
            cleanUpContainer(dockerObj.getContainer(containerID.id));
        }*/
        if (err !== '') {
            future.return(err);
        } else if (error) {
            console.log(error);
            future.return(error);
        } else {
            future.return(output);
        }
        /*
        var container = dockerObj.getContainer(containerID.id);
        container.remove(function (removeError) { //Container should be removed on exit
            if (removeError) {
                console.log(removeError); //Perhaps we should start a routine to make sure container is removed.
            }

        });
        */
    }).on('container', function () {
        //We don't bind volume from now on....
        //container.defaultOptions.start.Binds = [localFolder+':'+dockerFolder];
    });
    return future.wait();
};
