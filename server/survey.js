import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import { survey } from '../imports/api/db.js';

Meteor.startup(() => {

    Meteor.methods({
        'survey.submit'(data, id) {
            if (id) {
                return survey.update({
                    _id: id
                }, {
                    $set: {
                        user: Meteor.user().username,
                        survey: data,
                        createdAt: new Date()
                    }
                });
            } else {
                return survey.insert({
                    user: Meteor.user().username,
                    survey: data,
                    createdAt: new Date()
                });
            }
        },
        'survey.search'(user){
            return survey.find({user:user}).fetch();
        }
    });
});
