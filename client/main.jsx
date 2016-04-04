import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import App from 'grommet/components/App';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box'
import Menu from 'grommet/components/Menu'
import Anchor from 'grommet/components/Anchor'
import MenuIcon from 'grommet/components/icons/base/Menu'

import Timer from '../imports/ui/Timer.jsx';


class MainMenu extends Component {
    render () {
        return (
            <Menu icon={<MenuIcon />}>
                <Anchor href="#">
                    First
                </Anchor>
                <Anchor href="#">
                    Second
                </Anchor>
                <Anchor href="#">
                    Third
                </Anchor>
            </Menu>
        );
    }
};


class Main extends Component {
  render () {
    return (
        <App>
            <Header direction="row" large={true} justify="between"
                    pad={{horizontal: 'medium'}} colorIndex="neutral-1">
                <MainMenu/>
                <Box direction="row" pad={{between: 'medium'}}>
                    <Timer />
                </Box>
            </Header>
        </App>
    );
  }
};



Meteor.startup(() => {
    let element = document.getElementById('main');
    render(React.createElement(Main), element);
});
