import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { Mongo } from 'meteor/mongo';

import App from 'grommet/components/App';
import Section from 'grommet/components/Section';
import Header from 'grommet/components/Header';
import Box from 'grommet/components/Box';

import Menu from './menu.jsx';
import Timer from './Timer.jsx';
import Login from './login.jsx';
import Dashboard from './dashboard.jsx';

class Main extends Component {
    render () {
        return (
            <App>
                <Header direction="row" large={true} justify="between"
                        pad={{horizontal: 'medium'}} colorIndex="neutral-1">
                    <Menu/>
                    <Box direction="row" pad={{between: 'medium'}}>
                        <Timer />
                    </Box>
                </Header>
                <Section>
                    {
                        this.props.currentUser?
                        <span>Logged in as {this.props.currentUser.username}</span>:<Login/>
                    }
                </Section>
            </App>
        );
    }
};

Main.propTypes = {
    currentUser: PropTypes.object
};

export default createContainer(() => {
    return {
        currentUser: Meteor.user()
    }
}, Main);
