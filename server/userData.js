import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import {userData} from '../imports/api/db.js';


Meteor.startup(() => {
    Meteor.methods({
        'user.check'(id) {
            let user = userData.findOne({userID: id});
            if (!user) {
                userData.insert({
                    userID: id
                });
            }
        }
    });
});

const updateProblem = function (userID, problemID, isCorrect, code) {
    let user = userData.findOne({userID: userID});
    if (!user) return null;
    if (!user[problemID]) {
        user[problemID] = {
            result: false,
            log: []
        };
    }
    user[problemID].result = isCorrect;
    user[problemID].log.push({
        time: new Date,
        code: code,
        result: isCorrect
    });
    userData.update({
        userID: userID
    }, {
        $set: user
    });
};

export {updateProblem};
