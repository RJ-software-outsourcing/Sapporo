import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import {liveFeed} from '../imports/api/db.js';

Meteor.startup(() => {

    Meteor.methods({
        'liveFeed.add'(data) {
            liveFeed.insert({
                title: data.title,
                content: data.content,
                date_created: new Date()
            });
        },
        'liveFeed.delete'(data) {
            liveFeed.remove({
                _id: data._id
            }, function (err) {
                if (err) {
                    alert(err);
                }
            });
        }
    });
});
