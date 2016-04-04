import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

const timer = new Mongo.Collection('timer');

if (Meteor.isServer) {
    Meteor.publish('timer', function timerPublication() {
        return timer.find();
    });
}

export {timer}
