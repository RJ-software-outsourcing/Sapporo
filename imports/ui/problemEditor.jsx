import React, { Component, PropTypes} from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import Paper from 'material-ui/lib/paper';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import RaisedButton from 'material-ui/lib/raised-button';
import FlatButton from 'material-ui/lib/flat-button';
import Dialog from 'material-ui/lib/dialog';
import LinearProgress from 'material-ui/lib/linear-progress';

import brace from 'brace';
import AceEditor from 'react-ace';

import * as langType from '../library/lang_import.js';
import * as themeType from '../library/theme_import.js';
import 'brace/theme/tomorrow_night_blue';

import { docker } from '../api/db.js';
import {setLock, freeLock, isLock} from '../library/updateControl.js';

const split = {
    width: '50%',
    display: 'inline-block'
};
const textDiv = {
    width: '96%',
    padding: '0px 2%'
};

class ProblemEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            langType: null,
            theme: 'vibrant_ink',
            code: '',
            runCode: false
        };
    }
    updateCode(code) {
        let tmpObj = {
            _id: this.props.data._id,
            code: code
        };
        localStorage.setItem(tmpObj._id, JSON.stringify(tmpObj));
        freeLock();
    }
    updateLang(event, index, value) {
        for (var key in this.props._docker) {
            if (this.props._docker[key].title === value) {
                this.setState({
                    language: value,
                    langType: this.props._docker[key].langType
                });
            }
        }
    }
    renderLangOptions () {
        if (!this.props._docker) return;
        return this.props._docker.map((lang, key) => (
            <MenuItem key={key} value={lang.title} primaryText={lang.title}></MenuItem>
        ));
    }
    updateTheme(event, index, value) {
        this.setState({
            theme: value
        });
    }
    renderThemeOptions () {
        let themeList = [];
        for (var key in themeType) {
            if (key !== '__esModule') {
                themeList.push(key);
            }
        }
        return themeList.map((theme, key) => (
            <MenuItem key={key} value={theme} primaryText={theme}></MenuItem>
        ));
    }
    updatePageData () {
        if (!isLock()) {
            let tmpObj = localStorage.getItem(this.props.data._id);
            if (tmpObj) {
                tmpObj = JSON.parse(tmpObj);
                this.setState ({
                    code: tmpObj.code? tmpObj.code:''
                });
            }
            setLock();
        }
        if (this.state.langType === null && this.props._docker) {
            if (this.props._docker.length > 0) {
                this.setState({
                    langType: this.props._docker[0].langType,
                    language: this.props._docker[0].title
                });
            }
        }
    }
    componentDidMount () {
        this.updatePageData();
    }
    componentDidUpdate () {
        this.updatePageData();
    }
    componentWillUpdate (nextProp) {
        if (nextProp.data._id !== this.props.data._id) {
            freeLock();
        }
    }
    submitCode (isTest) {
        this.setState({runCode: true});
        let tmpObj = JSON.parse(localStorage.getItem(this.props.data._id));
        let obj = {
            problemID: this.props.data._id,
            language: this.state.language,
            code: tmpObj.code,
            user: this.props.currentUser
        };
        Meteor.call('docker.submitCode', obj, isTest, (err, result) => {
            this.setState({testResult:null});
            if (!err) {
                if (result.pass) {
                    alert('Success :D');
                    this.closeDialog();
                } else {
                    if (isTest) {
                        this.setState({testResult:result});
                    } else {
                        alert('Failed');
                        this.closeDialog();
                    }
                }
            } else {
                alert(err);
            }
        });
    }
    closeDialog() {
        this.setState({runCode: false, testResult: null});
    }
    render () {
        const  editorOption = {
            $blockScrolling: true
        };
        const actions = [
            <FlatButton label="Exit" secondary={true} onTouchTap={this.closeDialog.bind(this)}/>
        ];
        return (
            <div>
                <div style={{display:'inline-block', width: '100%', padding:'10px 0'}} >
                    <Paper style={{width: '49.5%', float:'left'}} zDepth={1}>
                        <div style={textDiv}>
                            <TextField  floatingLabelText="Title" type="text" style={{width: '80%'}}
                                        value={this.props.data.title}/>
                            <TextField  floatingLabelText="Score" type="text" style={{width: '20%'}}
                                        value={this.props.data.score}/>
                        </div>
                        <div style={textDiv}>
                            <TextField floatingLabelText="Description" type="text" style={{width: '100%'}}
                                       multiLine={true} rows={2} value={this.props.data.description}/>
                        </div>
                        <div style={textDiv}>
                            <TextField floatingLabelText="Input Example" type="text" multiLine={true} rows={2} style={split} value={this.props.data.exampleInput}/>
                            <TextField floatingLabelText="Output Example" type="text" multiLine={true} rows={2} style={split} value={this.props.data.exampleOutput}/>
                        </div>

                    </Paper>
                    <div style={{width: '49.5%', float:'right'}}>
                        <div>
                            <div style={{width:'50%', display:'inline-block'}}>
                                <SelectField value={this.state.language} onChange={this.updateLang.bind(this)}
                                             floatingLabelText="Language" style={{width:'50%'}} selectFieldRoot={{width:'100%'}}>
                                             {this.renderLangOptions()}
                                </SelectField>
                                <SelectField value={this.state.theme} onChange={this.updateTheme.bind(this)}
                                             floatingLabelText="Theme" style={{width:'50%'}} selectFieldRoot={{width:'100%'}}>
                                             {this.renderThemeOptions()}
                                </SelectField>
                            </div>
                            <div style={{display:'inline-block', float:'right'}}>
                                <RaisedButton label="Test"    primary={true} onTouchTap={this.submitCode.bind(this, true)}/>
                                <RaisedButton label="Submit"  secondary={true} onTouchTap={this.submitCode.bind(this, false)}/>
                            </div>
                        </div>
                        {this.state.langType?
                            <AceEditor mode={this.state.langType} theme={this.state.theme} onChange={this.updateCode.bind(this)} value={this.state.code} width='100%'
                                       name="UNIQUE_ID_OF_DIV" editorProps={editorOption} />
                              :''
                        }

                    </div>
                </div>
                <span>{this.props.data._id}</span>

                <Dialog title="Verifying..." actions={actions} modal={false} autoScrollBodyContent={true} contentStyle={{width:'90%', maxWidth:'100%', height: '95vh'}}
                        open={this.state.runCode} autoDetectWindowHeight={false}>
                    {this.state.testResult?
                        <div>
                            <TextField floatingLabelText="Test Input" type="text" style={{width:'100%'}} multiLine={true}
                                       value={this.state.testResult.testInput}/>
                            <div style={{width:'100%'}}>
                                <div style={{width:'48%',float:'left'}}>
                                    <TextField  floatingLabelText="My Output" type="text" style={{width: '100%'}}
                                                value={this.state.testResult.stdout} multiLine={true} />
                                </div>
                                <div style={{width:'48%', float:'right'}}>
                                    <TextField  floatingLabelText="Expected Output" type="text" style={{width: '100%'}}
                                                value={this.state.testResult.expected} multiLine={true} />
                                </div>
                            </div>
                        </div>
                        :  <LinearProgress mode="indeterminate"/>
                    }
                </Dialog>


            </div>
        );
    }
}


ProblemEditor.propTypes = {
    _docker: PropTypes.array.isRequired,
    currentUser: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('docker');
    return {
        _docker: docker.find({languages: true}).fetch(),
        currentUser: Meteor.user()
    };
}, ProblemEditor);
