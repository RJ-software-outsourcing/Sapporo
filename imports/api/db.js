import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

const timer   = new Mongo.Collection('timer');
const problem = new Mongo.Collection('problem');
const docker  = new Mongo.Collection('docker');
const userData  = new Mongo.Collection('userData');


if (Meteor.isServer) {
    Meteor.publish('timer', function timerPublication() {
        return timer.find();
    });
    Meteor.publish('docker', function dockerPublication() {
        return docker.find();
    });
    Meteor.publish('userData', function userDataPublication() {
        return userData.find();
    });
}

export {timer, problem, docker, userData};
