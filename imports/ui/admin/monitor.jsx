import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import { timer, requestLogs } from '../../api/db.js';
import { minutesAfterGameStart } from '../../library/timeLib.js';
import { logReason } from '../../library/logger.js';

const data = [
      {name: 'Page A', uv: 4000, pv: 2400, amt: 2400},
      {name: 'Page B', uv: 3000, pv: 1398, amt: 2210},
      {name: 'Page C', uv: 2000, pv: 9800, amt: 2290},
      {name: 'Page D', uv: 2780, pv: 3908, amt: 2000},
      {name: 'Page E', uv: 1890, pv: 4800, amt: 2181},
      {name: 'Page F', uv: 2390, pv: 3800, amt: 2500},
      {name: 'Page G', uv: 3490, pv: 4300, amt: 2100},
];

class Monitor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: []
        };
    }
    refactorLogs () {
        if (this.props._requestLogs && (this.props._requestLogs.length)) {
            return this.props._requestLogs.filter((log)=>{
                let minutes = minutesAfterGameStart(this.props._timer.start, this.props._timer.end, log.createdAt);
                if (minutes) {
                    log.minutes = minutes;
                    return log;
                }
            });
        } else {
            return [];
        }
    }
    refactorLogsForAreaChart () {
        let tmp = {};
        let result = [];
        this.state.logs.forEach((item) => {
            if (!tmp[item.minutes]) {
                tmp[item.minutes] = {};
            }
            if (!tmp[item.minutes][item.type]) {
                tmp[item.minutes][item.type] = 1;
            } else {
                tmp[item.minutes][item.type] += 1;
            }
        });
        for (let key in tmp) {
            let obj = tmp[key];
            obj.minutes = key;
            result.push(obj);
        }
        //console.log(result);
        return result;
    }
    displayErrorLog () {
        return this.state.logs.map((log, key)=>{
            if (log.type !== logReason.success) {
                return (<div key={key}>{log.minutes + ' - ' + log._id}</div>);
            }

        });
    }
    renderArea () {
        Object.keys(logReason).map((item)=> {
            return (
                <Area type='monotone' dataKey={item} stackId="1" stroke='#FFFFFF' fill='#8884d8' />
            );
        });
    }
    renderAreaChart () {
        return (
            <AreaChart width={600} height={400} data={this.refactorLogsForAreaChart()} margin={{top: 10, right: 30, left: 0, bottom: 0}} >
                <XAxis dataKey="minutes"/>
                <YAxis/>
                <CartesianGrid strokeDasharray="3 3"/>
                <Tooltip />
                <Area isAnimationActive={false} type='monotone' dataKey='reachMaxmimum' stackId="1" stroke='#8884d8' fill='#8884d8' />
                <Area isAnimationActive={false} type='monotone' dataKey='success' stackId="1" stroke='#82ca9d' fill='#82ca9d' />
            </AreaChart>
        );
    }
    componentDidUpdate () {
    }
    componentDidMount () {

    }
    componentWillUpdate (nextProp) {
        if (nextProp._requestLogs.length !== this.state.logs.length) {
            let log = this.refactorLogs(nextProp._requestLogs);
            this.setState({
                logs: log
            });
        }
    }
    render () {
        return (
            <div>
                {this.renderAreaChart()}
                {this.displayErrorLog()}
            </div>
        );
    }
}

Monitor.propTypes = {
    _requestLogs: PropTypes.array.isRequired,
    _timer: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('timer');
    Meteor.subscribe('requestLogs');
    return {
        _timer: timer.findOne({timeSync: true}),
        _requestLogs: requestLogs.find({}).fetch()
    };
}, Monitor);
