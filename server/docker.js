import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import {docker} from '../imports/api/db.js';
import Dockerode from 'dockerode';
import Future from 'fibers/future';

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
            console.log(data);
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
                future.throw('No Programming Languages has been configured');
                return;
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
        }
    });
});

/*
testDocker.run('python', ['python','--version'], process.stdout, function (err, data) {
    console.log(data);
});
*/
