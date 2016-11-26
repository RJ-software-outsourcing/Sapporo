import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { sapporo } from '../api/db.js';

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


class Login extends Component {
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
    }
    render () {
        const staffLoginAction = [
            <FlatButton label="cancel" secondary={true}   onTouchTap={this.closeStaffLogin.bind(this)}/>
        ];
        // Hide following login method for now
        //<RaisedButton style={loginButton} label="CodeWars Passport" primary={true} onTouchTap={this.loginOauth.bind(this)}/>
        //<RaisedButton style={loginButton} label="Facebook"          secondary={true} onTouchTap={this.loginFacebook.bind(this)}/>
        return (
            <div style={loginStyle}>
                <div>

                    <RaisedButton style={loginButton} label="Login"     primary={true} onTouchTap={this.openStaffLogin.bind(this)}/>
                </div>
                <Dialog modal={false} open={this.state.stafflogin} actions={staffLoginAction}>
                    <div>
                        <TextField  style={textFieldStyle} floatingLabelText="User Name" onChange={this.updateUsername.bind(this)}/>
                        <TextField  style={textFieldStyle} type="password" floatingLabelText="Password" onChange={this.updatePassword.bind(this)}/>
                    </div>
                    <div>
                        <RaisedButton style={loginButton} label="Login"  primary={true} onTouchTap={this.loginStaff.bind(this)}/>
                        {
                            this.props._sapporo?
                            (this.props._sapporo.createAccount? <RaisedButton style={loginButton} label="Create" secondary={true} onTouchTap={this.createStaff.bind(this)}/>:'')
                            :''
                        }

                    </div>
                </Dialog>
            </div>
        );
    }
}

Login.propTypes = {
    _sapporo: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('sapporo');
    return {
        _sapporo: sapporo.findOne({sapporo:true})
    };
}, Login);
