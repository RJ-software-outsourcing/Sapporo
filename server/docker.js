import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import {docker, problem} from '../imports/api/db.js';
import { commandForImage, commandForTest, resultCompare} from '../imports/library/docker.js';
import Dockerode from 'dockerode';
import Future from 'fibers/future';
import stream from 'stream';
import {createTestingFile, createUserFile} from './fileAccess.js';
import {updateProblem} from './userData.js';

Meteor.startup(() => {
    Meteor.methods({
        'docker.add'(data) {
            if (data._id) {
                docker.update({
                    _id: data._id
                }, {
                    $set: data
                });
            } else {
                data.languages = true;
                docker.insert(data);
            }
        },
        'docker.remove'(data) {
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
            port: 1234
        });
    }
    /*
    if ( (docker.find({languages: true}).fetch()).length === 0 ) {
        docker.insert({
            languages: true,
            title: 'Python 3',
            image: 'python:latest',
            executable: 'python',
            preArg: '',
            mountPath: '/usr/src/myapp/',
            file: 'test.py',
            middleArg: '',
            testInput: 'helloworld',
            postArg: ''
        });
    }
    */
    //Checking Docker
    Meteor.methods({
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
        }
    });
});

const getDockerInstance = function(dockerData) {
    return new Dockerode();
};

const dockerTest = function (dockerObj, lang) {
    let localTestFolder = createTestingFile(lang);
    let command = commandForTest(lang);
    let result = dockerRun(dockerObj, lang.image, command, localTestFolder, lang.mountPath);
    return result;
};
const userSubmit = function (_docker, data, langObj, testInput) {
    let localTestFolder = createUserFile(data, langObj, testInput);
    let command = commandForImage(langObj);
    let result = dockerRun(_docker, langObj.image, command, localTestFolder, langObj.mountPath);
    return result;
};

const dockerRun = function (dockerObj, image, command, localFolder, dockerFolder) {
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

    dockerObj.run(image, ['timeout', '5s', '/bin/bash', '-c', inputCommand], [stdout, stderr], {Tty:false}, function (error) {
        if (err !== '') {
            future.return(err);
        } else if (error) {
            future.return(error);
        } else {
            future.return(output);
        }
    }).on('container', function (container) {
        container.defaultOptions.start.Binds = [localFolder+':'+dockerFolder];
    });
    return future.wait();
};

/*
testDocker.run('python', ['python','--version'], process.stdout, function (err, data) {
    console.log(data);
});
*/
