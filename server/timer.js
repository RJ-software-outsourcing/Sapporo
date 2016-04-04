import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import {timer} from '../imports/api/db.js';
import { isCoding } from '../imports/library/timeLib.js';

let initGameTime = {
    start: {
        hr: 0,
        min: 0
    },
    end: {
        hr: 0,
        min: 0
    }
}

function updateTime () {
    let _time = new Date;
    let db_time = timer.findOne({timeSync: true});
    timer.update({
        timeSync: true
    }, {
        $set: {
            systemTime: _time,
            coding: isCoding(_time, db_time.gameTime)
        }
    });
    Meteor.setTimeout(updateTime, 1000);
}

Meteor.startup(() => {

    Meteor.methods({
        'time.update'(time) {
            timer.update({
                timeSync: true
            }, {
                $set: {gameTime: time}
            });
            console.log('New time has been configured');
        }
    });

    if ( (timer.find({timeSync: true}).fetch()).length === 0 ) {
        timer.insert({
            timeSync: true,
            coding: false,
            gameTime: initGameTime
        });
    }
    updateTime();
});
