import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import {docker} from '../imports/api/db.js';
import { commandForTest } from '../imports/library/docker.js';
import Dockerode from 'dockerode';
import Future from 'fibers/future';
import stream from 'stream';
import {createTestingFile} from './fileAccess.js';

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
            let testDocker = new Dockerode();
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
            let testDocker = new Dockerode();
            let result = [];
            for (var key in dockerData.languages) {
                result.push({
                    title  : dockerData.languages[key].title,
                    output : dockerTest(testDocker, dockerData.languages[key])
                });
            }
            return result;
        }
    });
});

const dockerTest = function (dockerObj, lang) {
    let localTestFolder = createTestingFile(lang);
    let command = commandForTest(lang);
    let result = dockerRun(dockerObj, lang.image, command, localTestFolder, lang.mountPath);
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
    dockerObj.run(image, command, [stdout, stderr], {Tty:false}, function (error, data) {
        future.return(output);
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
