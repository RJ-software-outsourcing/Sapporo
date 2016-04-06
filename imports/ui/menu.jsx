import React, { Component, PropTypes } from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import App from 'grommet/components/App';
import Box from 'grommet/components/Box';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import MenuIcon from 'grommet/components/icons/base/Menu';

import Admin from './admin.jsx';

class MainMenu extends Component {
    getProblems () {
        return [
            { _id: 1, title: 'problem 1'},
            { _id: 2, title: 'problem 2'},
            { _id: 3, title: 'problem 3'},
            { _id: 4, title: 'problem 4'}
        ];
    }
    renderProblems () {
        if (this.props.currentUser) {
            return this.getProblems().map((problem) => (
                <Anchor>{problem.title}</Anchor>
            ));
        } else {
            return (
                <Anchor></Anchor>
            );
        }
    }
    admin () {
        let element = document.getElementById('section');
        render(React.createElement(Admin), element);
    }
    logout () {
        Meteor.logout((err)=>{
            if (err) console.log(err);
        });
    }
    render () {
        return (
            <Menu icon={<MenuIcon/>}>
                <Box>
                    <Anchor>
                        Dashboard
                    </Anchor>
                    <Anchor onClick={this.admin}>
                        Admin
                    </Anchor>
                    {this.props.currentUser?
                        <Anchor onClick={this.logout}>Log Out</Anchor>: ''
                    }
                </Box>
                <Box colorIndex="light-1">
                    {this.props.currentUser? this.renderProblems(): ''}
                </Box>
            </Menu>
        );
    }
}

MainMenu.propTypes = {
    currentUser: PropTypes.object
};

export default createContainer(() => {
    return {
        currentUser: Meteor.user()
    }
}, MainMenu);
