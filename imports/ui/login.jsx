import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import ReactDOM from 'react-dom';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { userData } from '../api/db.js';

import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';

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
            password: '',
            stafflogin: false
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
    openStaffLogin () {
        this.setState({
            stafflogin: true
        });
    }
    closeStaffLogin () {
        this.setState({
            stafflogin: false
        });
    }
    loginStaff () {
        Meteor.loginWithPassword(this.state.username, this.state.password, (err) => {
            if (err) {
                alert(err);
            } else {
                this.checkUser();
            }
        });
    }
    createStaff () {
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
    loginOauth () {
        Meteor.loginWithMeteorOAuth2Server({}, (err) => {
            if (err) {
                alert(err);
            } else {
                this.checkUser();
            }
        });
    }
    removeOauth () {
        Meteor.call('resetServiceConfiguration');
    }
    loginFacebook () {
        Meteor.loginWithFacebook({}, (err) => {
            if (err) {
                alert(err);
            } else {
                this.checkUser();
            }
        });
    }
    componentDidMount() {
        // Use Meteor Blaze to render login buttons
        this.view = Blaze.render(Template.loginButtons,
            ReactDOM.findDOMNode(this.refs.container));
    }
    render () {
        const staffLoginAction = [
            <FlatButton label="cancel" secondary={true}   onTouchTap={this.closeStaffLogin.bind(this)}/>
        ];
        return (
            <div style={loginStyle}>
                <div>
                    <RaisedButton style={loginButton} label="CodeWars Passport"    primary={true} onTouchTap={this.loginOauth.bind(this)}/>
                    <RaisedButton style={loginButton} label="Delete Passport"    primary={true} onTouchTap={this.removeOauth.bind(this)}/>
                    <RaisedButton style={loginButton} label="Administrator"      secondary={true} onTouchTap={this.openStaffLogin.bind(this)}/>
                    <RaisedButton style={loginButton} label="Facebook"          secondary={true} onTouchTap={this.loginFacebook.bind(this)}/>
                    <span ref="container" />
                </div>
                <Dialog title="Login as Staff" modal={false} open={this.state.stafflogin} actions={staffLoginAction} open={this.state.stafflogin}>
                    <div>
                        <TextField  style={textFieldStyle} floatingLabelText="User Name" onChange={this.updateUsername.bind(this)}/>
                        <TextField  style={textFieldStyle} type="password" floatingLabelText="Password" onChange={this.updatePassword.bind(this)}/>
                    </div>
                    <div>
                        <RaisedButton style={loginButton} label="Login"  primary={true} onTouchTap={this.loginStaff.bind(this)}/>
                        <RaisedButton style={loginButton} label="Create" secondary={true} onTouchTap={this.createStaff.bind(this)}/>
                    </div>
                </Dialog>
            </div>
        );
    }
}
