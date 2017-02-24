import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { timer } from '../api/db.js';
import { timeSchedule } from '../library/timeLib.js';

const timerStyle = {
    height: '60px',
    position: 'relative',
    top: '50%',
    marginTop: '-30px'
};

class Timer extends Component {

    display () {
        if (this.props._timer) {
            let schedule = timeSchedule(this.props._timer.systemTime, this.props._timer.start, this.props._timer.end);
            if (schedule) {
                if (schedule.start && schedule.end) {
                    return 'End';
                } else {
                    let hr = Math.floor(schedule.time.min/60);
                    let min = schedule.time.min % 60;
                    if (schedule.start) {
                        return (
                            <div style={timerStyle}>
                                <span>
                                    Game On! Time Left:<br/>
                                    {`${hr}hr ${min}m ${schedule.time.sec}s`}
                                </span>
                            </div>
                        );
                    } else {
                        return (
                            <div style={timerStyle}>
                                <span>
                                    Game Will Start in<br/>
                                    {`${hr}hr ${min}m ${schedule.time.sec}s`}
                                </span>
                            </div>
                        );
                    }
                }
            } else {
                return 'No Config';
            }
        }
    }
    render () {
        return this.display();
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
