import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

const timer   = new Mongo.Collection('timer');
const problem = new Mongo.Collection('problem');
const docker  = new Mongo.Collection('docker');
const testCases  = new Mongo.Collection('testCases');
const userData  = new Mongo.Collection('userData');
const liveFeed  = new Mongo.Collection('liveFeed');
const sapporo  = new Mongo.Collection('sapporo');

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
    Meteor.publish('liveFeed', function liveFeedPublication() {
        return liveFeed.find();
    });
    Meteor.publish('testCases', function testCasesPublication() {
        return testCases.find();
    });
    Meteor.publish('sapporo', function sapporoPublication() {
        return sapporo.find();
    });
}

export {timer, problem, docker, userData, liveFeed, testCases, sapporo};
