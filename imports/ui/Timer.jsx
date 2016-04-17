import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { timer } from '../api/db.js';
import { timeSchedule } from '../library/timeLib.js';


class Timer extends Component {

    display () {
        if (this.props._timer) {
            let schedule = timeSchedule(this.props._timer.systemTime, this.props._timer.gameTime);
            if (schedule.start && schedule.end) {
                return 'End';
            } else {
                return ((!schedule.start && !schedule.end)? 'Begins In: ': '') + schedule.time.min + ' min ' + schedule.time.sec + ' sec';
            }
        }
    }
    render () {
        return (
            <span>{this.display()}</span>
        );
    }
}

Timer.propTypes = {
    _timer: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('timer');
    return {
        _timer: timer.findOne({timeSync: true})
    };
}, Timer);
