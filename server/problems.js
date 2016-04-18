import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import {problem} from '../imports/api/db.js';

Meteor.startup(() => {

    Meteor.methods({
        'problem.add'(data) {
            problem.insert(data);
        },
        'problem.update'(data) {
            problem.update({
                _id: data._id
            }, {
                $set: data
            });
        },
        'problem.delete'(data) {
            problem.remove({
                _id: data._id
            }, function (err) {
                if (err) {
                    alert(err);
                }
            });
        }
    });
});
