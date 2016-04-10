import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

const timer   = new Mongo.Collection('timer');
const problem = new Mongo.Collection('problem');
const docker  = new Mongo.Collection('docker');

if (Meteor.isServer) {
    Meteor.publish('timer', function timerPublication() {
        return timer.find();
    });
    Meteor.publish('problem', function problemPublication() {
        return problem.find();
    });
    Meteor.publish('docker', function dockerPublication() {
        return docker.find();
    });
}

export {timer, problem, docker};
