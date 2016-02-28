/*
    Common functions for accessing built-in MongoDB
*/

Problems = new Mongo.Collection("problems");
userDataCollection = new Mongo.Collection("userData");

Meteor.methods({
    getAllProblems: function () {
        if (! Meteor.userId()) {
            //throw new Meteor.Error("not-authorized");
            //return Problems.find({}).fetch();
        }
        return Problems.find({}).fetch();
    }
});
