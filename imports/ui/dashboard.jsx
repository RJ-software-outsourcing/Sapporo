import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Timer from './Timer.jsx';

import GridList from 'material-ui/lib/grid-list/grid-list';
import GridTile from 'material-ui/lib/grid-list/grid-tile';

import { problem, userData } from '../api/db.js';
import { getTotalScore, getUserTotalScore, getCurrentUserData, getUserPassedProblem } from '../library/score_lib.js';

const styles = {
    gridList: {
        width: '100%',
        overflowY: 'auto',
        marginTop:'10px'
    }
};
const cellHeight = function () {
    if (window.innerWidth > 1600) {
        return 400;
    } else {
        return 200;
    }
};

const getTimerTile = function (timer) {
    const timeStyle = {
        height: 'inherit',
        textAlign:'center',
        lineHeight: String(cellHeight())+'px',
        fontSize: String(cellHeight())+'%',
        fontWeight: 'bold'
    };
    return(
        <div style={timeStyle}>
            {timer}
        </div>
    );
};


class Dashboard extends Component {
    tileStyle(tile) {
        return {
            backgroundImage: 'url("' + tile.image + '")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
        };
    }
    getScoreTile () {
        if (!this.props._problem || !Meteor.user()) return;
        const scoreStyle = {
            height: 'inherit',
            textAlign:'center',
            lineHeight: String(cellHeight())+'px',
            fontSize: String(cellHeight())+'%',
            fontWeight: 'bold'
        };
        let userData = getCurrentUserData(Meteor.user()._id, this.props._userData);
        let score = getUserTotalScore(userData, this.props._problem);
        let totalScore = getTotalScore(this.props._problem);
        return (
            <div style={scoreStyle}>
                <span>{score} / {totalScore}</span>
            </div>
        );
    }
    getPassProblemTile () {
        if (!this.props._problem || !Meteor.user()) return;
        const passStyle = {
            height: 'inherit',
            textAlign:'center',
            lineHeight: String(cellHeight())+'px',
            fontSize: String(cellHeight())+'%',
            fontWeight: 'bold'
        };
        let totalProblem = this.props._problem.length;
        let userData = getCurrentUserData(Meteor.user()._id, this.props._userData);
        let passProblem = getUserPassedProblem(userData, this.props._problem)
        return (
            <div style={passStyle}>
                <span>{passProblem} / {totalProblem}</span>
            </div>
        );
    }
    getContent (tile) {
        let contentStyle = {
            height: 'inherit',
            backgroundColor: tile.backgroundColor? tile.backgroundColor:'rgba(255,255,255,0.4)'
        };
        return (
            <div style={contentStyle}>
                {tile.content}
            </div>
        );
    }
    render () {
        const tilesData = [{
            title: 'Hi ' + Meteor.user().username,
            featured: true,
            cols: 2,
            image: '/images/1.jpg'
        }, {
            title: 'Live Feed Messages',
            cols: 2,
            image: '/images/6.jpg'
        }, {
            title: 'Time',
            cols: 2,
            image: '/images/3.jpg',
            backgroundColor: 'rgba(255,255,255,0.8)',
            content: getTimerTile(<Timer/>)
        }, {
            title: 'Total Score',
            featured: true,
            cols: 1.5,
            image: '/images/4.jpg',
            backgroundColor: 'rgba(255,255,255,0.8)',
            content: this.getScoreTile()
        }, {
            title: 'Passed Problems',
            cols: 1.5,
            image: '/images/5.jpg',
            backgroundColor: 'rgba(255,255,255,0.8)',
            content: this.getPassProblemTile()
        }, {
            title: 'Online Help',
            featured: true,
            cols: 1.5,
            image: '/images/3.jpg'
        }, {
            title: 'About Us',
            cols: 1.5,
            image: '/images/5.jpg'
        }];
        return (
            <div>
                <GridList cols={6} cellHeight={cellHeight()} padding={5} style={styles.gridList}>
                          {tilesData.map((tile, key) => (
                    <GridTile key={key} title={tile.title}
                              actionPosition="left" titlePosition="bottom"
                              titleBackground="rgba(0, 0, 0, 0.6)" children={this.getContent(tile)}
                              cols={tile.cols} rows={1} style={this.tileStyle(tile)}>
                    </GridTile>
                  ))}
                </GridList>
            </div>
        );
    }
}

Dashboard.propTypes = {
    _userData: PropTypes.array.isRequired,
    _problem: PropTypes.array.isRequired,
    currentUser: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('userData');
    Meteor.subscribe('problem');
    return {
        currentUser: Meteor.user(),
        _userData: userData.find({}).fetch(),
        _problem: problem.find({}).fetch()
    };
}, Dashboard);
