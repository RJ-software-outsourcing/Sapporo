import React, { Component } from 'react';

import Tabs from 'material-ui/lib/tabs/tabs';
import Tab from 'material-ui/lib/tabs/tab';

import System from './admin/system.jsx';

const tabStyle = {
    backgroundColor: 'white',
    color: 'black'
};

export default class Admin extends Component {
    render () {
        return (
            <Tabs primary={false}>
                <Tab label="System" style={tabStyle}>
                    <System />
                </Tab>
                <Tab label="Problem" style={tabStyle}>

                </Tab>
                <Tab label="Docker" style={tabStyle}>

                </Tab>
            </Tabs>
        );
    }
}
