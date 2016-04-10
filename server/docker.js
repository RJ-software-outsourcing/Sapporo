import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import {docker} from '../imports/api/db.js';

let dockerLock = true;
let dockerInstance = {};

function validateDockerInstance () {
    //Hahaha
}

function dockerCheckingRoutine () {
    //check if db has been updated (always true on system start)
    //check docker instance based on new setting
    //If fail, dockerLock = false
    //We may check on current docker as well

    Meteor.setTimeout(dockerCheckingRoutine, 30000); //Check every 30 seconds
}

Meteor.startup(() => {
    Meteor.methods({
        'docker.add'(data) {
            let temp = docker.findOne({docker: true});
            temp.languages.push(data);
            docker.update({
                _id: temp._id
            }, {
                $set: {
                    languages: temp.languages
                }
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
                image: 'python',
                mountPath: '/usr/src/myapp/',
                executable: 'python',
                preArg: '',
                postArg: ''
            }]
        });
    }
    //dockerCheckingRoutine ();
});
