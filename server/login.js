import { Meteor } from 'meteor/meteor';

Meteor.methods({
    findLoginService: function (serviceName) {
        let target = ServiceConfiguration.configurations.findOne({
            service: serviceName
        });
        console.log(target);
        return (target? true:false);
    },
    resetFacebookLogin: function () {
        ServiceConfiguration.configurations.remove({
            service: 'facebook'
        });
    },
    configFacebookLogin: function (data) {
        ServiceConfiguration.configurations.insert({
            service: 'facebook',
            appId: data.appID,
            secret: data.secret
        });
    },
    resetCodewarsPassportLogin: function () {
        ServiceConfiguration.configurations.remove({
            service: 'MeteorOAuth2Server'
        });
    },
    configCodewarsPassportLogin: function (data) {
        ServiceConfiguration.configurations.insert({
            service: 'MeteorOAuth2Server',
            clientId: data.appID,
            secret: data.secret,
            baseUrl: data.url,
            loginUrl: data.url,
            loginStyle: 'popup'
        });
    }
});
