import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { timer } from '../api/timer.js';

import Box from 'grommet/components/Box'


class Timer extends Component {
    render () {
        return (
            <Box>{this.props._timer? this.props._timer._id:''}</Box>
        );
    }
};

Timer.propTypes = {
    _timer: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('timer');
    return {
        _timer: timer.findOne({timeSync: true})
    }
}, Timer);
