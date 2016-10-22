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

import { docker } from '../../api/db.js';
import { testCases } from '../../api/db.js';

class PerformanceTest extends Component {
    constructor(props) {
        super(props);
        this.state = {
            caseDialog: false,
            resultDialog: false,
            selectCase: null,
            testCaseSent: 0,
            testCaseResolved: 0
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
    updateLangType (event, index, value) {
        let temp = this.state.selectCase;
        temp['langType'] = value;
        this.setState({
            selectCase: temp
        });
    }
    startTest () {
        var testCases = this.props._testCases;
        var sentCount = 0;
        var resolveCount = 0;
        this.resultDialogOpen(true);
        for (var key in testCases) {
            sentCount += 1;
            this.setState({testCaseSent: sentCount});
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
            });
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
                            {this.state.testCaseResolved}/{this.state.testCaseSent}
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
