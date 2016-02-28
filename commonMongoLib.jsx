/*
    Common functions for accessing built-in MongoDB
*/

Problems = new Mongo.Collection("problems");
userDataCollection = new Mongo.Collection("userData");
timeSync = new Mongo.Collection("timeSync");

if (Meteor.isServer) {
    Meteor.publish("problemsData", function () {
        return Problems.find({});
    });
    Meteor.publish("timer", function () {
        return timeSync.find({});
    });
    Meteor.publish("userData", function () {
        return userDataCollection.find({});
    });
}


if (Meteor.isClient) {
    //Meteor.subscribe('problemsData');
    Meteor.subscribe('timer');
    Meteor.subscribe('problemsData');
    Meteor.subscribe('userData');
}
