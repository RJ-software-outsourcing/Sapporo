import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import {problem} from '../imports/api/db.js';

Meteor.startup(() => {

    Meteor.methods({
        'problem.add'(data) {
            problem.insert(data);
            console.log(data);
        },
        'problem.update'(data) {
            problem.update({
                _id: data._id
            }, {
                $set: data
            });
            console.log(data);
        },
        'problem.delete'(data) {
            problem.remove({
                _id: data._id
            }, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(data._id + ' deleted');
                }
            });
        }
    });
});
