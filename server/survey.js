import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import { survey } from '../imports/api/db.js';

Meteor.startup(() => {

    Meteor.methods({
        'survey.submit'(data) {
            survey.insert({
                user: Meteor.user().username,
                survey: [data]
            });
            return true;
        }
    });
});
