import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import {timer} from '../imports/api/timer.js';

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
    var _time = new Date;

    timer.update({
        timeSync: true
    }, {
        $set: {
            systemTime: _time,
            coding: false
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
