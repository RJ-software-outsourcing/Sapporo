import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import LinearProgress from 'material-ui/lib/linear-progress';
import Divider from 'material-ui/lib/divider';

import { problem, userData, sapporo } from '../../api/db.js';
import { getUserTotalScore, problemSolvedCount, getTotalScore } from '../../library/score_lib.js';

class Rank extends Component {
    problemSolvedCounting (item) {
        return problemSolvedCount(item, this.props._userData);
    }
    renderProblemAnswerRate () {
        this.sortPropsArray('_problem', (item) => {
            return this.problemSolvedCounting(item);
        });
        return this.props._problem.map((item, key) => {
            let solvedCount = this.problemSolvedCounting(item);
            return (
                <ListItem key={key} primaryText={item.title} secondaryText={String(solvedCount)}>
                    <LinearProgress mode="determinate" max={this.props._userData.length} value={solvedCount}
                                    color="green" style={{height:'15px'}}/>
                </ListItem>
            );
        });
    }
    sortPropsArray (arrayName, compare) {
        let array = this.props[arrayName];
        array.sort((a, b) => {
            let _a = compare(a);
            let _b = compare(b);
            if (_a > _b) {
                return -1;
            } else if (_a < _b) {
                return 1;
            } else {
                return 0;
            }
        });
    }
    renderAllUser () {
        if (!this.props._userData || this.props._userData.length === 0) return;
        this.sortPropsArray('_userData', (item) => {
            return getUserTotalScore(item, this.props._problem);
        });
        return this.props._userData.map((item, key) => {
            let userTotalScore = getUserTotalScore(item, this.props._problem);
            return (
                <ListItem key={key} primaryText={item.userID} secondaryText={String(userTotalScore)}>
                    <LinearProgress mode="determinate" max={getTotalScore(this.props._problem)} value={userTotalScore}
                                    color="coral" style={{height:'15px'}}/>
                </ListItem>
            );
        });
    }
    render () {
        return (
            <div>
                <h3>Current Execution Count</h3>
                {this.props._sapporo.current}
                <Divider />
                <h3>Problem Solving Count</h3>
                <List>
                    {this.renderProblemAnswerRate()}
                </List>
                <Divider />
                <h3>Ranking</h3>
                <List>
                    {this.renderAllUser()}
                </List>

            </div>
        );
    }
}

Rank.propTypes = {
    _userData: PropTypes.array.isRequired,
    _problem: PropTypes.array.isRequired,
    _sapporo: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('userData');
    Meteor.subscribe('problem');
    Meteor.subscribe('sapporo');
    return {
        _userData: userData.find({}).fetch(),
        _problem: problem.find({}).fetch(),
        _sapporo: sapporo.findOne({sapporo: true})
    };
}, Rank);
