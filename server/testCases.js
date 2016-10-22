import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import {testCases} from '../imports/api/db.js';

Meteor.startup(() => {

    Meteor.methods({
        'testCases.add'(data) {
            if (Meteor.user().username !== 'admin') return;
            testCases.insert(data);
        },
        'testCases.update'(data) {
            if (Meteor.user().username !== 'admin') return;
            testCases.update({
                _id: data._id
            }, {
                $set: data
            });
        },
        'testCases.delete'(data) {
            if (Meteor.user().username !== 'admin') return;
            testCases.remove({
                _id: data._id
            }, function (err) {
                if (err) {
                    alert(err);
                }
            });
        }
    });
});
