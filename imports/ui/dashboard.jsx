import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import Box from 'grommet/components/Box'

class Dashboard extends Component {
    render () {
        return (
            <span>Hello {this.props.currentUser.username}</span>
        );
    }
};

Dashboard.propTypes = {
    currentUser: PropTypes.object
};

export default createContainer(() => {
    return {
        currentUser: Meteor.user()
    }
}, Dashboard);
