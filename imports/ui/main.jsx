import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import injectTapEventPlugin from 'react-tap-event-plugin';

import { problem, userData, timer, liveFeed } from '../api/db.js';

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
import ProblemIcon from 'material-ui/lib/svg-icons/editor/insert-drive-file';
import ChartIcon from 'material-ui/lib/svg-icons/editor/insert-chart';
import ExtensionIcon from 'material-ui/lib/svg-icons/action/extension';
import MessageIcon from 'material-ui/lib/svg-icons/communication/message';
import MailIcon from 'material-ui/lib/svg-icons/communication/mail-outline';

import Login from './login.jsx';
import Dashboard from './dashboard.jsx';
import ProblemEditor from './problemEditor.jsx';
import System from './admin/system.jsx';
import ProblemConfig from './admin/problemConfig.jsx';
import DockerConfig from './admin/dockerConfig.jsx';
import Rank from './admin/rank.jsx';
import LiveFeed from './admin/liveFeed.jsx';

import { getCurrentUserData,  isUserPassedProblem } from '../library/score_lib.js';
import { setMailAsRead, isMailRead, getNumberOfUnread } from '../library/mail.js';
import {freeLock} from '../library/updateControl.js';

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
    renderSection () {
        freeLock();
        const sectionDOM = document.getElementById('section');
        if (this.props.currentUser) {
            switch (this.state.sectionState) {
            case 'dashboard':
                render(<Dashboard />, sectionDOM);
                break;
            case 'problemEditor':
                render(<ProblemEditor data={this.state.problem}/>, sectionDOM);
                break;
            case 'system':
                render(<System />, sectionDOM);
                break;
            case 'problemConfig':
                render(<ProblemConfig />, sectionDOM);
                break;
            case 'dockerConfig':
                render(<DockerConfig />, sectionDOM);
                break;
            case 'analyse':
                render(<Rank />, sectionDOM);
                break;
            case 'liveFeed':
                render(<LiveFeed />, sectionDOM);
                break;
            default:
                render(<Dashboard />, sectionDOM);
            }
        } else {
            render(React.createElement(Login), sectionDOM);
        }
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
                    <MenuItem key={key} leftIcon={icon} onTouchTap={this.renderPage.bind(this, 'problemEditor', problem)}
                              primaryText={problem.title} secondaryText={problem.score}/>
                );
            }
        });
    }
    unreadMailCount () {
        let count = getNumberOfUnread(this.props._liveFeed);
        return (count === 0)? '':String(count);
    }
    renderPage (page, arg) {
        let state = {
            sectionState: page
        };
        if (page === 'problemEditor' && arg) state.problem = arg;
        this.setState(state);
        this.navClose();
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
                    <MenuItem leftIcon={<DashboardIcon />} onTouchTap={this.renderPage.bind(this, 'dashboard')}>Dashboard</MenuItem>
                    <MenuItem leftIcon={<MailIcon />} onTouchTap={this.renderPage.bind(this, 'dashboard')} secondaryText={this.unreadMailCount()}>Inbox</MenuItem>
                    <MenuItem leftIcon={<AboutIcon />}>About</MenuItem>
                    <Divider />
                    <MenuItem leftIcon={<LogoutIcon />} onTouchTap={this.logout.bind(this)}>Log Out</MenuItem>
                    <Divider />
                    <MenuItem>Administrator</MenuItem>
                    <MenuItem leftIcon={<AdminIcon />} onTouchTap={this.renderPage.bind(this, 'system')}>System Settings</MenuItem>
                    <MenuItem leftIcon={<ProblemIcon />} onTouchTap={this.renderPage.bind(this, 'problemConfig')}>Problem Configuration</MenuItem>
                    <MenuItem leftIcon={<ExtensionIcon />} onTouchTap={this.renderPage.bind(this, 'dockerConfig')}>Docker Settings</MenuItem>
                    <MenuItem leftIcon={<ChartIcon />} onTouchTap={this.renderPage.bind(this, 'analyse')}>Data Analyse</MenuItem>
                    <MenuItem leftIcon={<MessageIcon />} onTouchTap={this.renderPage.bind(this, 'liveFeed')}>Live Feed</MenuItem>
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
    _liveFeed: PropTypes.array.isRequired,
    _timer: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('problem');
    Meteor.subscribe('userData');
    Meteor.subscribe('timer');
    Meteor.subscribe('liveFeed');
    return {
        currentUser: Meteor.user(),
        _userData: userData.find({}).fetch(),
        _problem: problem.find({}).fetch(),
        _timer: timer.findOne({timeSync: true}),
        _liveFeed: liveFeed.find({}, {sort: {date_created: -1}}).fetch()
    };
}, Main);
