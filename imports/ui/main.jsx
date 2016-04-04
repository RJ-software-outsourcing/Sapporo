import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { render, unmountComponentAtNode } from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

import App from 'grommet/components/App';
import Section from 'grommet/components/Section';
import Header from 'grommet/components/Header';
import Box from 'grommet/components/Box';
import Configuration from 'grommet/components/icons/base/Configuration';

import Menu from './menu.jsx';
import Timer from './Timer.jsx';
import Login from './login.jsx';
import Dashboard from './dashboard.jsx';
import Admin from './admin.jsx';

class Main extends Component {
    renderConfig () {
        unmountComponentAtNode(document.getElementById('section'));
        render(React.createElement(Admin), document.getElementById('section'));
    }
    renderSection () {
        unmountComponentAtNode(document.getElementById('section'));
        if (this.props.currentUser) {
            render(React.createElement(Dashboard), document.getElementById('section'));
        } else {
            render(React.createElement(Login), document.getElementById('section'));
        }
    }
    componentDidMount () {
        this.renderSection();
    }
    componentDidUpdate () {
        this.renderSection();
    }
    render () {
        return (
            <App>
                <Header direction="row" large={true} justify="between"
                        pad={{horizontal: 'medium'}} colorIndex="neutral-1">
                    <Menu/>
                    <Box direction="row" pad={{between: 'medium'}}>
                        <Timer />
                        <Box onClick={this.renderConfig}><Configuration /></Box>
                    </Box>
                </Header>
                <section id="section"></section>
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
