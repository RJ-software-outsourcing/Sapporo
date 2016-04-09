import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

const timer = new Mongo.Collection('timer');
const problem = new Mongo.Collection('problem');

if (Meteor.isServer) {
    Meteor.publish('timer', function timerPublication() {
        return timer.find();
    });
    Meteor.publish('problem', function timerPublication() {
        return problem.find();
    });
}

export {timer, problem};
