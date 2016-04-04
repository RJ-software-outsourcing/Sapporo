import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import Box from 'grommet/components/Box'
import Button from 'grommet/components/Button'

export default class Login extends Component {
    login () {
        const username = ReactDOM.findDOMNode(this.refs.username).value.trim();
        const password = ReactDOM.findDOMNode(this.refs.password).value.trim();
        Meteor.loginWithPassword(username, password, (err) => {
            if (err) alert('Login Failed');
        });
    }
    create () {
        Accounts.createUser({
            username: ReactDOM.findDOMNode(this.refs.username).value.trim(),
            password: ReactDOM.findDOMNode(this.refs.password).value.trim()
        }, (err) => {
            if (err) alert('Create Failed');
        });
    }
    render () {
        return (
            <Box align="center" direction="column"
                 justify="center" pad={{between: 'small'}}>
                <input type="text" placeholder="User Name" ref="username"/>
                <input type="password" placeholder="Password" ref="password"/>
                <Button label="Login" onClick={this.login.bind(this)}/>
                <Button label="Create" accent={true} onClick={this.create.bind(this)}/>
            </Box>
        );
    }
};
