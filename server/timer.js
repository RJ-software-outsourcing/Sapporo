import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import {timer} from '../imports/api/db.js';
import {problem} from '../imports/api/db.js';
import { isCoding } from '../imports/library/timeLib.js';

function updateTime () {
    let _time = new Date();
    let db_time = timer.findOne({timeSync: true});
    let coding = isCoding(_time, db_time.start, db_time.end);
    timer.update({
        timeSync: true
    }, {
        $set: {
            systemTime: _time,
            coding: coding
        }
    });
    Meteor.setTimeout(updateTime, 1000);
}

Meteor.startup(() => {

    Meteor.methods({
        'time.updateGameTime'(start, end) {
            if (Meteor.user().username !== 'admin') return;
            timer.update({
                timeSync: true
            }, {
                $set: {
                    start: start,
                    end: end
                }
            });
        }
    });

    if ((timer.find({timeSync: true}).fetch()).length === 0 ) {
        timer.insert({
            timeSync: true,
            coding: false,
            start: null,
            end: null
        });
    }
    updateTime();
});
