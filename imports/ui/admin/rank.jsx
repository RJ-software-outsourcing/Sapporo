import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';


import { problem, userData } from '../../api/db.js';
import { getUserTotalScore } from '../../library/score_lib.js';

class Rank extends Component {

    displayText (item) {
        let totalScore = getUserTotalScore(item, this.props._problem);
        return "Team " + item.userID + ' has ' + String(totalScore);
    }
    renderAllUser () {
        if (!this.props._userData || this.props._userData.length === 0) return;
        return this.props._userData.map((item, key) => (
            <div key={key}>
                <span>{this.displayText(item)}</span>
            </div>
        ));
    }
    render () {
        return (
            <div>
                {this.renderAllUser()}
            </div>
        );
    }
}

Rank.propTypes = {
    _userData: PropTypes.array.isRequired,
    _problem: PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('userData');
    Meteor.subscribe('problem');
    return {
        _userData: userData.find({}).fetch(),
        _problem: problem.find({}).fetch()
    };
}, Rank);
