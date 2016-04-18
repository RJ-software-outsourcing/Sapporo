import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import injectTapEventPlugin from 'react-tap-event-plugin';

import { problem, userData, timer } from '../api/db.js';

import AppBar from 'material-ui/lib/app-bar';
import LeftNav from 'material-ui/lib/left-nav';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Divider from 'material-ui/lib/divider';
import DashboardIcon from 'material-ui/lib/svg-icons/action/dashboard';
import AdminIcon from 'material-ui/lib/svg-icons/action/settings';
import AboutIcon from 'material-ui/lib/svg-icons/action/code';
import LogoutIcon from 'material-ui/lib/svg-icons/action/exit-to-app';
import NotpassIcon from 'material-ui/lib/svg-icons/image/panorama-fish-eye';
import DoneIcon from 'material-ui/lib/svg-icons/action/check-circle';

import Login from './login.jsx';
import Dashboard from './dashboard.jsx';
import Admin from './admin.jsx';
import ProblemEditor from './problemEditor.jsx';

import { getCurrentUserData,  isUserPassedProblem } from '../library/score_lib.js';


injectTapEventPlugin(); //Workaround for Meterial-UI with React verion under 1.0

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open : false,
            sectionState: 'login'
        };
    }
    navOpen () {
        this.setState({open:true});
    }
    navClose () {
        this.setState({open:false});
    }
    logout () {
        Meteor.logout((err)=>{
            this.navClose();
            if (err) {
                alert(err);
            }
        });
    }
    adminPage () {
        this.setState({sectionState: 'admin'});
        this.navClose();
    }
    renderSection () {
        const sectionDOM = document.getElementById('section');
        if (this.props.currentUser) {
            switch (this.state.sectionState) {
            case 'admin':
                render(<Admin />, sectionDOM);
                break;
            case 'dashboard':
                render(<Dashboard />, sectionDOM);
                break;
            case 'problemEditor':
                render(<ProblemEditor data={this.state.problem}/>, sectionDOM);
                break;
            default:
                render(<Dashboard />, sectionDOM);
            }
        } else {
            render(React.createElement(Login), sectionDOM);
        }
    }
    dashboard () {
        this.setState({sectionState: 'dashboard'});
        this.navClose();
    }
    renderProblemEditor (problem) {
        this.setState({sectionState: 'problemEditor', problem: problem});
        this.navClose();
    }
    renderProblems () {
        let array = this.props._problem;
        array.sort((a, b) => {
            let _a = parseInt(a.score);
            let _b = parseInt(b.score);
            if (_a < _b) {
                return -1;
            } else if (_a > _b) {
                return 1;
            } else {
                return 0;
            }
        });
        return array.map((problem, key) => {
            if (!this.props._timer || !this.props._timer.coding || !Meteor.user()) {
                return ;
            } else {
                let currentUser = null;
                if (Meteor.user()) {
                    currentUser = getCurrentUserData(Meteor.user()._id, this.props._userData);
                }
                let icon = <NotpassIcon />;
                if (isUserPassedProblem(currentUser, problem._id)) {
                    icon = <DoneIcon />;
                }
                return (
                    <MenuItem key={key} leftIcon={icon} onTouchTap={this.renderProblemEditor.bind(this, problem)}
                              primaryText={problem.title} secondaryText={problem.score}/>
                );
            }
        });
    }
    componentDidMount () {
        this.renderSection();
    }
    componentDidUpdate () {
        this.renderSection();
    }
    render () {
        return (
            <div>
                <AppBar title="Sapporo" onLeftIconButtonTouchTap={this.navOpen.bind(this)}>
                </AppBar>
                <LeftNav  docked={false} open={this.state.open}
                          onRequestChange={this.navClose.bind(this)}>
                    <MenuItem leftIcon={<DashboardIcon />} onTouchTap={this.dashboard.bind(this)}>Dashboard</MenuItem>
                    <MenuItem leftIcon={<AdminIcon />} onTouchTap={this.adminPage.bind(this)}>Administrator</MenuItem>
                    <MenuItem leftIcon={<AboutIcon />}>About</MenuItem>
                    <Divider />
                    <MenuItem leftIcon={<LogoutIcon />} onTouchTap={this.logout.bind(this)}>Log Out</MenuItem>
                    <Divider />
                    <MenuItem>problem</MenuItem>
                    {this.renderProblems()}
                </LeftNav>
                <div id="section"></div>
            </div>
        );
    }
}


Main.propTypes = {
    _userData: PropTypes.array.isRequired,
    currentUser: PropTypes.object,
    _problem: PropTypes.array.isRequired,
    _timer: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('problem');
    Meteor.subscribe('userData');
    Meteor.subscribe('timer');
    return {
        currentUser: Meteor.user(),
        _userData: userData.find({}).fetch(),
        _problem: problem.find({}).fetch(),
        _timer: timer.findOne({timeSync: true})
    };
}, Main);
