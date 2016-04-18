import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Timer from './Timer.jsx';

import GridList from 'material-ui/lib/grid-list/grid-list';
import GridTile from 'material-ui/lib/grid-list/grid-tile';
import AccountIcon from 'material-ui/lib/svg-icons/action/account-circle';
import MessageIcon from 'material-ui/lib/svg-icons/communication/message';
import ClockIcon from 'material-ui/lib/svg-icons/device/access-time';
import TotalIcon from 'material-ui/lib/svg-icons/toggle/star-half';
import PassIcon from 'material-ui/lib/svg-icons/navigation/check';
import OnlineIcon from 'material-ui/lib/svg-icons/action/question-answer';
import AboutIcon from 'material-ui/lib/svg-icons/action/code';
import IconButton from 'material-ui/lib/icon-button';

import { problem, userData } from '../api/db.js';
import { getTotalScore, getUserTotalScore, getCurrentUserData, getUserPassedProblem } from '../library/score_lib.js';

const styles = {
    gridList: {
        width: '100%',
        overflowY: 'auto',
        marginTop:'5px'
    }
};
const cellHeight = function () {
    if (window.innerWidth > 1600) {
        return 400;
    } else {
        return 200;
    }
};
const customTileStyle = {
    height: 'inherit',
    textAlign:'center',
    lineHeight: String(cellHeight())+'px',
    fontSize: String(cellHeight())+'%',
    fontWeight: 'bold',
    color: 'white'
};
const getTimerTile = function (timer) {

    return(
        <div style={customTileStyle}>
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
        let userData = getCurrentUserData(Meteor.user()._id, this.props._userData);
        let score = getUserTotalScore(userData, this.props._problem);
        let totalScore = getTotalScore(this.props._problem);
        return (
            <div style={customTileStyle}>
                <span>{score} / {totalScore}</span>
            </div>
        );
    }
    getPassProblemTile () {
        if (!this.props._problem || !Meteor.user()) return;
        let totalProblem = this.props._problem.length;
        let userData = getCurrentUserData(Meteor.user()._id, this.props._userData);
        let passProblem = getUserPassedProblem(userData, this.props._problem);
        return (
            <div style={customTileStyle}>
                <span>{passProblem} / {totalProblem}</span>
            </div>
        );
    }
    getContent (tile) {
        let contentStyle = {
            height: 'inherit',
            backgroundColor: tile.backgroundColor? tile.backgroundColor:'rgba(255,255,255,0.3)'
        };
        return (
            <div style={contentStyle}>
                {tile.content}
            </div>
        );
    }
    render () {
        const tilesData = [{
            title: Meteor.user()? Meteor.user().username:'',
            featured: true,
            cols: 2,
            image: '/images/1.jpg',
            backgroundColor: 'rgba(0,40,80,0.3)',
            icon: <IconButton><AccountIcon color="white" /></IconButton>
        }, {
            title: 'Live Feed Messages',
            cols: 2,
            image: '/images/6.jpg',
            backgroundColor: 'rgba(0,165,200,1)',
            icon: <IconButton><MessageIcon color="white" /></IconButton>
        }, {
            title: 'Time',
            cols: 2,
            image: '/images/6.jpg',
            backgroundColor: 'rgba(0,40,80, 0.6)',
            content: getTimerTile(<Timer/>),
            icon: <IconButton><ClockIcon color="white" /></IconButton>
        }, {
            title: 'Total Score',
            featured: true,
            cols: 1.5,
            image: '/images/4.jpg',
            backgroundColor: 'rgba(120,30,30,0.6)',
            content: this.getScoreTile(),
            icon: <IconButton><TotalIcon color="white" /></IconButton>
        }, {
            title: 'Passed Problems',
            cols: 1.5,
            image: '/images/3.jpg',
            backgroundColor: 'rgba(80,40,0,0.6)',
            content: this.getPassProblemTile(),
            icon: <IconButton><PassIcon color="white" /></IconButton>
        }, {
            title: 'Online Help',
            featured: true,
            cols: 1.5,
            image: '/images/3.jpg',
            backgroundColor: 'rgba(0,165,165,1)',
            icon: <IconButton><OnlineIcon color="white" /></IconButton>
        }, {
            title: 'About Us',
            cols: 1.5,
            image: '/images/5.jpg',
            backgroundColor: 'rgba(0,80,160,0.5)',
            icon: <IconButton><AboutIcon color="white" /></IconButton>
        }];
        return (
            <div>
                <GridList cols={6} cellHeight={cellHeight()} padding={5} style={styles.gridList}>
                          {tilesData.map((tile, key) => (
                    <GridTile key={key} title={tile.title}
                              actionIcon={tile.icon}
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
