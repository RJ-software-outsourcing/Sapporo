import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

const timer   = new Mongo.Collection('timer');
const problem = new Mongo.Collection('problem');
const docker  = new Mongo.Collection('docker');
const testCases  = new Mongo.Collection('testCases');
const userData  = new Mongo.Collection('userData');
const liveFeed  = new Mongo.Collection('liveFeed');
const sapporo  = new Mongo.Collection('sapporo');
const batchAccount = new Mongo.Collection('batchAccount');
const requestLogs = new Mongo.Collection('requestLogs');
const survey = new Mongo.Collection('survey');

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
    Meteor.publish('batchAccount', function batchAccountPublication() {
        var user = Meteor.users.findOne(this.userId);
        if (user.username && (user.username === 'admin')) {
            return batchAccount.find();
        }
    });
    Meteor.publish('requestLogs', function requestLogsPublication() {
        var user = Meteor.users.findOne(this.userId);
        if (user.username && (user.username === 'admin')) {
            return requestLogs.find();
        }
    });
    Meteor.publish('survey', function () {
        return survey.find();
    });
    Meteor.publish('problem', function problemPublication(coding_fake) {
        // Not using the argument passed from front-end to prevent hacking.
        
        var db_time = timer.findOne({timeSync: true});
        var coding = db_time && db_time.coding;
        var user = Meteor.users.findOne(this.userId);
        
        if (user && user.username && user.username == 'admin') {
            return problem.find();
        } else if (coding && user) {
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
        } else {
            return this.ready();
        }
    });
}

export {timer, problem, docker, userData, liveFeed, testCases, sapporo, batchAccount, requestLogs, survey};
