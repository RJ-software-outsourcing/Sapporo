import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Timer from './Timer.jsx';


class Dashboard extends Component {
    render () {
        return (
            <div>
                <span>Hello {this.props.currentUser.username}</span>
                <Timer />
            </div>
        );
    }
}

Dashboard.propTypes = {
    currentUser: PropTypes.object
};

export default createContainer(() => {
    return {
        currentUser: Meteor.user()
    };
}, Dashboard);
