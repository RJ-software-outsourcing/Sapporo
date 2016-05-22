import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import {timer} from '../imports/api/db.js';
import {problem} from '../imports/api/db.js';
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
};
let problemPublished = false;

function updateTime () {
    let _time = new Date;
    let db_time = timer.findOne({timeSync: true});
    let coding = isCoding(_time, db_time.gameTime);
    timer.update({
        timeSync: true
    }, {
        $set: {
            systemTime: _time,
            coding: coding
        }
    });
    if (!problemPublished && coding) {
        Meteor.publish('problem', function dockerPublication() {
            var user = Meteor.users.findOne(this.userId);
            if (!user) {
                return;
            } else if (user.username && (user.username === 'admin')) {
                return problem.find();
            } else {
                return problem.find({}, {
                    fields: {
                        description: 1,
                        exampleInput: 1,
                        exampleOutput: 1,
                        images: 1,
                        score: 1,
                        testInput: 1,
                        testOutput: 1,
                        title: 1
                    }
                });
            }
        });
        problemPublished = true;
    }
    Meteor.setTimeout(updateTime, 1000);
}

Meteor.startup(() => {

    Meteor.methods({
        'time.update'(time) {
            if (Meteor.user().username !== 'admin') return;
            timer.update({
                timeSync: true
            }, {
                $set: {gameTime: time}
            });
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
