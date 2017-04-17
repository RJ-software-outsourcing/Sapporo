import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import {language} from '../imports/api/db.js';

Meteor.startup(() => {

    Meteor.methods({
        'language.add'(data) {
            if (Meteor.user().username !== 'admin') return;
            language.insert(data);
        },
        'language.update'(data) {
            if (Meteor.user().username !== 'admin') return;
            language.update({
                _id: data._id
            }, {
                $set: data
            });
        },
        'language.delete'(data) {
            if (Meteor.user().username !== 'admin') return;
            language.remove({
                _id: data._id
            }, function (err) {
                if (err) {
                    alert(err);
                }
            });
        }
    });
});
