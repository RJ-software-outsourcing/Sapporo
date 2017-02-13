import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import IconButton from 'material-ui/lib/icon-button';
import DeleteIcon from 'material-ui/lib/svg-icons/action/delete';
import RaisedButton from 'material-ui/lib/raised-button';
import FlatButton from 'material-ui/lib/flat-button';
import Dialog from 'material-ui/lib/dialog';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import LinearProgress from 'material-ui/lib/linear-progress';

import { docker } from '../../api/db.js';
import { testCases } from '../../api/db.js';

var sentCount = 0;
var resolveCount = 0;
var keepTestingInterval = null;

class PerformanceTest extends Component {
    constructor(props) {
        super(props);
        this.state = {
            caseDialog: false,
            resultDialog: false,
            keepTestingDialog: false,
            selectCase: null,
            testCaseSent: 0,
            testCaseResolved: 0,
            repeat: 1,
            period: 10,
            repeatMyself: false,
            result: '',
            keepTestingExeTIme: 0,
            testResponse: null,
            testErr: null
        };
    }
    renderLangOptions () {
        return this.props._dockerLangs.map((lang, key) => (
            <MenuItem key={key} value={lang._id} primaryText={lang.title}></MenuItem>
        ));
    }
    addCase () {
        Meteor.call('testCases.add', {
            langType: this.props._dockerLangs[0]._id,
            testInput: '',
            testScript: ''
        }, (err) => {
            if (err) {
                alert(err);
            }
        });
    }
    updateCase () {
        let selectCase = this.state.selectCase;
        Meteor.call('testCases.update', selectCase, (err) => {
            if (err) {
                alert(err);
            }
            this.caseDialogOpen(false);
        });
    }
    removeCase (cases) {
        Meteor.call('testCases.delete', cases, (err) => {
            if (err) {
                alert(err);
            }
        });
    }
    caseDialogOpen (selectCase) {
        this.setState({
            caseDialog: selectCase? true:false,
            selectCase: selectCase? selectCase:null
        });
    }
    resultDialogOpen (isOpen) {
        this.setState({
            resultDialog: isOpen
        });
        if (!isOpen) {
            this.setState({
                testCaseSent: 0,
                testCaseResolved: 0,
                result: ''
            });
        }
    }
    deleteIcon (cases) {
        return (
            <IconButton touch={true} tooltip="delete" tooltipPosition="bottom-left" onTouchTap={this.removeCase.bind(this, cases)}>
                <DeleteIcon />
            </IconButton>
        );
    }
    getLanguageTitle (langType) {
        for (var key in this.props._dockerLangs) {
            if (langType === this.props._dockerLangs[key]._id) {
                return this.props._dockerLangs[key].title;
            }
        }
    }
    renderTestCases () {
        return this.props._testCases.map((cases, key) => (
            <ListItem key={key} primaryText={this.getLanguageTitle(cases.langType)} secondaryText={cases.langType} rightIconButton={this.deleteIcon(cases)}
                      onTouchTap={this.caseDialogOpen.bind(this, cases)} style={{borderBottom: '1px solid #DDD'}}/>
        ));
    }
    updateCaseState (field, event) {
        let temp = this.state.selectCase;
        temp[field] = event.target.value;
        this.setState({
            selectCase : temp
        });
    }
    updateRepeat (event) {
        this.setState({
            repeat: event.target.value
        });
    }
    updatePeriod (event) {
        this.setState({
            period: event.target.value
        });
    }
    updateLangType (event, index, value) {
        let temp = this.state.selectCase;
        temp['langType'] = value;
        this.setState({
            selectCase: temp
        });
    }
    startTest () {
        var repeatTimes = Number(this.state.repeat);
        if (isNaN(repeatTimes) || repeatTimes <= 0) {
            alert("Invalid repeat time");
            return;
        }
        var ticks_start = performance.now();
        var ticks_end = null;
        var testCases = this.props._testCases;
        sentCount = 0;
        resolveCount = 0;
        this.resultDialogOpen(true);
        for (var repeat=0; repeat < repeatTimes; repeat++) {
            for (var key in testCases) {
                sentCount += 1;
                this.setState({testCaseSent: sentCount});
                //console.log('Sent key:' + testCases[key].langType);
                Meteor.call('docker.performanceTest', {
                    code: testCases[key].testScript,
                    input: testCases[key].testInput,
                    langType: testCases[key].langType
                }, (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log(result);
                    resolveCount += 1;
                    this.setState({testCaseResolved: resolveCount});
                    if (resolveCount === sentCount) {
                        ticks_end =  performance.now();
                        var totalTime = (ticks_end - ticks_start)/1000;
                        this.setState({
                            result: 'It takes ' + String(Math.round((totalTime*1000))/1000) + ' seconds to execute ' + String(sentCount) + ' Submission'
                        });
                    }
                });
            }
        }

    }
    keepTestingDialogOpen (isOpen) {
        this.setState ({
            keepTestingDialog: isOpen
        });
        if (!isOpen) {
            clearInterval(keepTestingInterval);
            console.log("Closing interval: " + String(keepTestingInterval));
            keepTestingInterval = null;
            this.setState({
                repeatMyself: false
            });
        }
    }
    runSingleTest() {
        var testCases = this.props._testCases;
        var testCasesCount = testCases.length;
        var choosenCase = testCases[(Math.floor((Math.random() * 100) + 1) % testCasesCount)]; //Randomly choose one case
        var ticks_start = performance.now();
        var ticks_end = null;
        Meteor.call('docker.performanceTest', {
            code: choosenCase.testScript,
            input: choosenCase.testInput,
            langType: choosenCase.langType
        }, (err, result) => {
            ticks_end =  performance.now();
            this.setState({
                keepTestingExeTIme: ((ticks_end - ticks_start)/1000).toFixed(4),
                testErr: err,
                testResponse: result
            });
            if (this.state.repeatMyself && !err) {
                this.runSingleTest();
            } else if (this.state.repeatMyself && err && (err.error === 503)) {
                setTimeout(()=> { //If we reach maximum concurrent user, stall for 0.5s otherwise it gets too brutal for logger
                    this.runSingleTest();
                }, 500);
            }
        });
    }
    keepTesting (isRepeat) {
        this.keepTestingDialogOpen(true);
        if (!isRepeat) { //Submit test case periodically
            var period = Number(this.state.period);
            if (isNaN(period) || period <= 0) {
                alert('Invalid period value');
                return;
            }
            keepTestingInterval = setInterval(this.runSingleTest.bind(this), period * 1000);
        } else { //Test another case after a finished one
            this.setState({
                repeatMyself: true
            });
            this.runSingleTest();
        }

    }
    render () {
        const actions = [
            <FlatButton label="Cancel" secondary={true} onTouchTap={this.caseDialogOpen.bind(this, false)}/>,
            <FlatButton label="Update" primary={true}   onTouchTap={this.updateCase.bind(this, null)}/>
        ];
        return (
            <div>

                <List>
                    {this.renderTestCases()}
                </List>
                <RaisedButton label="Add Test Case" primary={true} onTouchTap={this.addCase.bind(this)}/>
                <RaisedButton label="Start Performance Test" secondary={true} onTouchTap={this.startTest.bind(this)}/>
                <TextField type="text" value={this.state.repeat} floatingLabelText="Repeat Times" onChange={this.updateRepeat.bind(this)} multiLine={false}/>


                <div>
                    <RaisedButton label="Keep Sending Random Test Case Periodically" primary={true} onTouchTap={this.keepTesting.bind(this, false)}/>
                    <TextField type="text" value={this.state.period} floatingLabelText="Period (seconds)" onChange={this.updatePeriod.bind(this)} multiLine={false}/>
                </div>

                <div>
                    <RaisedButton label="Sending Random Test Case after one another" primary={true} onTouchTap={this.keepTesting.bind(this, true)}/>
                </div>


                {this.state.selectCase?
                <Dialog actions={actions} modal={false} autoScrollBodyContent={true} contentStyle={{width:'90%', maxWidth:'100%'}}
                        open={this.state.caseDialog} onRequestClose={this.caseDialogOpen.bind(this, false)} autoDetectWindowHeight={true}>
                        <SelectField  value={this.state.selectCase.langType}  onChange={this.updateLangType.bind(this)}
                                      floatingLabelText="Language" style={{top:'-8px'}}>{this.renderLangOptions()}</SelectField>
                        <div>
                            <TextField type="text" value={this.state.selectCase.testInput} floatingLabelText="Test Input" onChange={this.updateCaseState.bind(this, 'testInput')} multiLine={true} style={{width:'100%'}}/>
                            <TextField type="text" value={this.state.selectCase.testScript} floatingLabelText="Testing Script" onChange={this.updateCaseState.bind(this, 'testScript')} multiLine={true} style={{width:'100%'}}/>
                        </div>

                </Dialog>
                : ''}
                {this.state.resultDialog?
                    <Dialog modal={false} autoScrollBodyContent={true} contentStyle={{width:'90%', maxWidth:'100%'}}
                            open={this.state.resultDialog} onRequestClose={this.resultDialogOpen.bind(this, false)} autoDetectWindowHeight={true}>
                            <LinearProgress mode="determinate" value={this.state.testCaseResolved} max={this.state.testCaseSent}/>
                            {this.state.testCaseResolved}/{this.state.testCaseSent}
                            <div>
                                <span>{this.state.result}</span>
                            </div>
                    </Dialog>
                : ''}

                {this.state.keepTestingDialog?
                    <Dialog modal={false} autoScrollBodyContent={true} contentStyle={{width:'90%', maxWidth:'100%'}}
                            open={this.state.keepTestingDialog} onRequestClose={this.keepTestingDialogOpen.bind(this, false)} autoDetectWindowHeight={true}>
                            <div>time: {this.state.keepTestingExeTIme}</div>
                            {this.state.testErr?
                                <div style={{color:'red'}}><h3>{this.state.testErr.reason}</h3></div>
                                :
                                <div>Result: <span style={{color:'green'}}>{this.state.testResponse}</span></div>
                            }
                    </Dialog>
                : ''}

            </div>
        );
    }
}

PerformanceTest.propTypes = {
    _dockerGlobal: PropTypes.object,
    _dockerLangs:  PropTypes.array.isRequired,
    _testCases:    PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('docker');
    Meteor.subscribe('testCases');
    return {
        _dockerGlobal: docker.findOne({global: true}),
        _dockerLangs:  docker.find({languages: true}).fetch(),
        _testCases:    testCases.find({}).fetch()
    };
}, PerformanceTest);
