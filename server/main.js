import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import {sapporo} from '../imports/api/db.js';

Meteor.startup(() => {

    Meteor.methods({
        'sapporo.updateSapporo'(data) {
            if (Meteor.user().username !== 'admin') return;
            sapporo.update({
                sapporo: true
            }, {
                $set: {
                    title: data.title,
                    createAccount: data.createAccount,
                    timeout: data.timeout
                }
            });
        },
        'sapporo.getTitle'() {
            return sapporo.findOne({sapporo:true}).title;
        },
        'sapporo.getTimeout'() {
            return sapporo.findOne({sapporo:true}).timeout;
        },
        'sapporo.getCreateAccount'() {
            return sapporo.findOne({sapporo:true}).createAccount;
        }
    });

    if ((sapporo.find({sapporo:true}).fetch()).length === 0) {
        sapporo.insert({
            sapporo:true,
            title: 'sapporo',
            timeout: 10,
            createAccount: true
        });
    }
});
