import React, { Component } from 'react';

import Tabs from 'grommet/components/Tabs'
import Tab from 'grommet/components/Tab'

import System from './admin/system.jsx';

export default class Admin extends Component {
    render () {
        return (
            <Tabs>
                <Tab title="System">
                    <System />
                </Tab>
                <Tab title="Problems">
                    <h3>Second Tab</h3>
                    <p>Contents of the second tab</p>
                </Tab>
                <Tab title="Docker">
                    <h3>Third Tab</h3>
                    <p>Contents of the third tab</p>
                </Tab>
            </Tabs>
        );
    }
};
