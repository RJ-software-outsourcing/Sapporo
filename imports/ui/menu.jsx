import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { Mongo } from 'meteor/mongo';

import App from 'grommet/components/App';
import Section from 'grommet/components/Section';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import MenuIcon from 'grommet/components/icons/base/Menu';

export default class MainMenu extends Component {
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
    render () {
        return (
            <Menu icon={<MenuIcon/>}>
                <Box>
                    <Anchor href="#">
                        Dashboard
                    </Anchor>
                    <Anchor href="#">
                        Admin
                    </Anchor>
                    <Anchor href="#">
                        Analyse
                    </Anchor>
                </Box>
                <Box colorIndex="light-1">
                    {this.renderProblems()}
                </Box>
            </Menu>
        );
    }
};
