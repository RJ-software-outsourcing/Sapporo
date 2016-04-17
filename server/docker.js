import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import {docker, problem} from '../imports/api/db.js';
import { commandForImage, commandForTest, resultCompare} from '../imports/library/docker.js';
import Dockerode from 'dockerode';
import Future from 'fibers/future';
import stream from 'stream';
import {createTestingFile, createUserFile} from './fileAccess.js';

Meteor.startup(() => {
    Meteor.methods({
        'docker.add'(data) {
            let temp = docker.findOne({docker: true});
            temp.languages.push(data);
            docker.update({
                _id: temp._id
            }, {
                $set: {languages: temp.languages}
            });
        },
        'docker.remove'(key) {
            let temp = docker.findOne({docker: true});
            temp.languages.splice(key, 1);
            docker.update({
                _id: temp._id
            }, {
                $set: temp
            });
        },
        'docker.update'(data) {
            docker.update({
                _id: data._id
            }, {
                $set: data
            });
        }
    });

    if ( (docker.find({docker: true}).fetch()).length === 0 ) {
        docker.insert({
            docker: true,
            ip: 'localhost',
            timeout: 3,
            port: 1234,
            languages: [{
                title: 'Python 3',
                image: 'python:latest',
                mountPath: '/usr/src/myapp/',
                executable: 'python',
                preArg: '',
                postArg: ''
            }]
        });
    }

    //Checking Docker
    Meteor.methods({
        'docker.checkImage'() {
            let future = new Future();
            let dockerData = docker.findOne({docker: true});
            if (dockerData.languages.length === 0) {
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
                let result = dockerData.languages.map((lang)=>{
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
            let dockerData = docker.findOne({docker: true});
            let testDocker = getDockerInstance();
            let result = [];
            for (var key in dockerData.languages) {
                result.push({
                    title  : dockerData.languages[key].title,
                    output : dockerTest(testDocker, dockerData.languages[key])
                });
            }
            return result;
        },
        'docker.submitCode'(data, isTest){
            console.log(data);
            let dockerData = docker.findOne({docker: true});
            let problemData = problem.findOne({_id:data.problemID});
            let _docker = getDockerInstance(dockerData);
            let langObj = null;
            for (var key in dockerData.languages) {
                if (dockerData.languages[key].title === data.language) {
                    langObj = dockerData.languages[key];
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
    let localTestFolder = createUserFile(data);
    let command = commandForImage(langObj, testInput);
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
    dockerObj.run(image, command, [stdout, stderr], {Tty:false}, function (error) {
        if (err !== '') {
            future.return(err);
        } else if (error) {
            future.return(error);
        } else if (output) {
            future.return(output);
        } else {
            future.return('Weird');
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
