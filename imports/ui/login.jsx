import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import { userData } from '../api/db.js';

import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';

const loginStyle = {
    width: '60%',
    marginLeft: '20%',
    textAlign: 'center'
};
const textFieldStyle = {
    width: '100%'
};
const loginButton = {
    margin: '10px'
};


export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
        };
    }
    updateUsername(event) {
        this.setState({username: event.target.value});
    }
    updatePassword(event) {
        this.setState({password: event.target.value});
    }
    checkUser () {
        Meteor.call('user.check', Meteor.user()._id, function (err) {
            if (err) alert('User Check failed');
        });
    }
    login () {
        Meteor.loginWithPassword(this.state.username, this.state.password, (err) => {
            if (err) {
                alert(err);
            } else {
                this.checkUser();
            }
        });
    }
    create () {
        Accounts.createUser({
            username: this.state.username,
            password: this.state.password
        }, (err) => {
            if (err) {
                alert(err);
            } else {
                this.checkUser();
            }
        });
    }
    render () {
        return (
            <div style={loginStyle}>
                <div>
                    <TextField  style={textFieldStyle} floatingLabelText="User Name" onChange={this.updateUsername.bind(this)}/>
                    <TextField  style={textFieldStyle} type="password" floatingLabelText="Password" onChange={this.updatePassword.bind(this)}/>
                </div>
                <div>
                    <RaisedButton style={loginButton} label="Login"  primary={true} onTouchTap={this.login.bind(this)}/>
                    <RaisedButton style={loginButton} label="Create" secondary={true} onTouchTap={this.create.bind(this)}/>
                </div>
            </div>
        );
    }
}
