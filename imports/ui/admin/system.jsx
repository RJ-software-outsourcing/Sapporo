import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { timer } from '../../api/db.js';

import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button'

let initState = {
    time: {
        start: {
            hr: -1,
            min: -1
        },
        end: {
            hr: -1,
            min: -1
        }
    }
}

class System extends Component {
    constructor(props) {
        super(props);
        this.state = initState;
    }
    submit () {
        Meteor.call('time.update', this.state.time);
    }
    startH (event) {
        let time = this.state.time;
        time.start.hr = event.target.value;
        this.setState({
            time: time
        });
    }
    startM (event) {
        let time = this.state.time;
        time.start.min = event.target.value;
        this.setState({
            time: time
        });
    }
    endH (event) {
        let time = this.state.time;
        time.end.hr = event.target.value;
        this.setState({
            time: time
        });
    }
    endM (event) {
        let time = this.state.time;
        time.end.min = event.target.value;
        this.setState({
            time: time
        });
    }
    componentDidMount () {
        this.setState({
            time: this.props._timer.gameTime
        });
    }
    render () {
        return (
            <Box direction="column" align="center" pad={{between:"large"}}>
                <Box direction="row" pad={{between:"small"}} align="center">
                    <span>Start Time:</span>
                    <input type="number" min="0" max="23" placeholder="HR"
                           onChange={this.startH.bind(this)} value={this.state.time.start.hr}/>
                    <input type="number" min="0" max="59" placeholder="MIN"
                           onChange={this.startM.bind(this)} value={this.state.time.start.min}/>
                    <span>End Time:</span>
                    <input type="number" min="0" max="23" placeholder="HR"
                           onChange={this.endH.bind(this)} value={this.state.time.end.hr}/>
                    <input type="number" min="0" max="59" placeholder="MIN"
                           onChange={this.endM.bind(this)} value={this.state.time.end.min}/>
                </Box>
                <Button label="Submit" onClick={this.submit.bind(this)}/>
            </Box>
        );
    }
};

System.propTypes = {
    _timer: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('timer');
    return {
        _timer: timer.findOne({timeSync: true})
    }
}, System);
