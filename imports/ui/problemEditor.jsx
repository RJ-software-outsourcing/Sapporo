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

import Carousel from 'nuka-carousel';

import brace from 'brace';
import AceEditor from 'react-ace';

import * as langType from '../library/lang_import.js';
import * as themeType from '../library/theme_import.js';
import 'brace/theme/tomorrow_night_blue';
import { timeDiffSecond } from '../library/timeLib.js';

import { getCurrentUserData,  isUserPassedProblem } from '../library/score_lib.js';

import { docker, userData, sapporo } from '../api/db.js';

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
            runCode: false,
            updateLock: true,
            lastSubmitTime: null
        };
    }
    updateCode(code) {
        let tmpObj = JSON.parse(localStorage.getItem(this.props.data._id));
        if (!tmpObj) {
            tmpObj = {};
        }
        tmpObj.code = code;
        localStorage.setItem(this.props.data._id, JSON.stringify(tmpObj));
        this.setState({
            code: tmpObj.code
        });
    }
    updateLang(event, index, value) {
        for (var key in this.props._docker) {
            if (this.props._docker[key].title === value) {
                let tmpObj = JSON.parse(localStorage.getItem(this.props.data._id));
                if (!tmpObj) {
                    tmpObj = {};
                }
                tmpObj.language = value;
                tmpObj.langType = this.props._docker[key].langType;
                localStorage.setItem(this.props.data._id, JSON.stringify(tmpObj));
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
        let tmpObj = localStorage.getItem(this.props.data._id);
        if (tmpObj) {
            tmpObj = JSON.parse(tmpObj);
            this.setState ({
                code: tmpObj.code? tmpObj.code:'',
                language: tmpObj.language? tmpObj.language: '',
                langType: tmpObj.langType? tmpObj.langType: null
            });
        } else {
            this.setState({
                code: ''
            });
        }

        if (this.state.langType === null && this.props._docker) {
            if (this.props._docker.length > 0) {
                this.setState({
                    langType: this.props._docker[0].langType,
                    language: this.props._docker[0].title
                });
            }
        }
        this.setState({
            updateLock: true
        });
    }
    componentDidMount () {
        this.setState({
            updateLock: false
        });
    }
    componentDidUpdate () {
        if (!this.state.updateLock) {
            this.updatePageData();
        }
    }
    componentWillUpdate (nextProp) {
        if (nextProp.data._id !== this.props.data._id) {
            this.setState({
                updateLock: false
            });
        }
    }
    submitCode (isTest) {
        // Already hide from UI.
        // if (!isTest && this.alreadyPass() && !(confirm('You already solved this problem. Are you sure you want to submit again? Your current result will be overrided.'))) {
        //     return;
        // }
        let tmpObj = JSON.parse(localStorage.getItem(this.props.data._id));
        if (!isTest) {
            if (!tmpObj.passTest) {
                alert('You must pass test before submit');
                return;
            }
        }

        if (tmpObj.code.length > 10000) {
            alert('Your submission is rejected because your code size is too large');
            return;
        }

        let now = new Date();
        if ((isTest || !tmpObj.passTest) && this.state.lastSubmitTime && (timeDiffSecond(this.state.lastSubmitTime, now) < this.props._sapporo.submitwait) ) {
            alert(`Please wait at least ${this.props._sapporo.submitwait} seconds between each submission. Last submission was ${timeDiffSecond(this.state.lastSubmitTime, now)} seconds ago.`);
            return;
        } else {
            this.setState({
                lastSubmitTime: now
            });
        }

        this.setState({runCode: true});
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
                    if (isTest) {
                        let tmpObj = JSON.parse(localStorage.getItem(this.props.data._id));
                        tmpObj.passTest = true;
                        localStorage.setItem(this.props.data._id, JSON.stringify(tmpObj));
                        alert('You\'ve passed testing. You can now submit your code.');
                    } else {
                        alert('Your submission is correct! Congrats :D');
                    }
                    this.closeDialog();
                } else {
                    // No matter it's a test or a submission, always set the
                    // pass fail.
                    let tmpObj = JSON.parse(localStorage.getItem(this.props.data._id));
                    tmpObj.passTest = false;
                    localStorage.setItem(this.props.data._id, JSON.stringify(tmpObj));
                    if (isTest) {
                        this.setState({testResult:result});
                    } else {
                        alert('Failed! Please verify your code.');
                        this.closeDialog();
                    }
                }
            } else {
                if (err.error && (err.error === 503)) {
                    alert(err.reason);
                } else {
                    alert(err);
                }
                this.closeDialog();
            }
            //this.closeDialog();
        });
    }
    closeDialog() {
        this.setState({runCode: false, testResult: null});
    }
    renderImages () {
        if (!this.props.data.images) {
            return;
        }
        return this.props.data.images.map((item, key) => (
            <div key={key}>
                <span style={{textAlign:'center', width:'100%'}}>{item.title}</span>
                <img  src={item.content} style={{width:'100%', opacity:'0.9'}}/>
            </div>
        ));
    }
    alreadyPass () {
        let currentUser = getCurrentUserData(Meteor.user()._id, this.props._userData);
        if (isUserPassedProblem(currentUser, this.props.data._id)) {
            return true;
        } else {
            return false;
        }
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
                {this.alreadyPass()?
                    <Paper style={{width:'100%', textAlign:'center'}}>
                        <h3 style={{color:'green'}}>You've Solved This Problem!</h3>
                    </Paper>
                    :''
                }
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
                            <TextField floatingLabelText="Input Example" type="text" multiLine={true} rows={2} style={{width:'100%'}} value={this.props.data.exampleInput}/>
                        </div>
                        <div style={textDiv}>
                            <TextField floatingLabelText="Output Example" type="text" multiLine={true} rows={2} style={{width:'100%'}} value={this.props.data.exampleOutput}/>
                        </div>
                        {
                            (this.props.data.images.length > 0)?
                            <Carousel showArrows={true} framePadding={'10px'}>
                                {this.renderImages()}
                            </Carousel>
                            :''
                        }


                    </Paper>
                    <div style={{width: '49.5%', float:'right'}}>
                        <div>
                            <div style={{width:'50%', display:'inline-block'}}>
                                <SelectField value={this.state.language} onChange={this.updateLang.bind(this)} floatingLabelText="Language" >
                                             {this.renderLangOptions()}
                                </SelectField>
                            </div>
                            {
                                this.alreadyPass()?
                                '':
                                <div style={{display:'inline-block', float:'right'}}>
                                    <RaisedButton label="Test before submit"    primary={true} onTouchTap={this.submitCode.bind(this, true)}/>
                                    <RaisedButton label="Submit"  secondary={true} onTouchTap={this.submitCode.bind(this, false)} style={{marginLeft: '5px'}}/>
                                </div>
                            }

                        </div>
                        {
                            this.state.langType?
                            <AceEditor mode={this.state.langType} theme={this.state.theme} onChange={this.updateCode.bind(this)} value={this.state.code} width='100%'
                                       name="UNIQUE_ID_OF_DIV" editorProps={editorOption} height="700px"></AceEditor>
                                   :<span>Choose a language to start</span>
                        }

                    </div>
                </div>

                <Dialog title=" " modal={false} autoScrollBodyContent={true} contentStyle={{width:'90%', maxWidth:'100%', height: '95vh'}}
                        open={this.state.runCode} autoDetectWindowHeight={false}>
                    {this.state.testResult?
                        <div>
                            <span style={{color:'red'}}>Not correct</span>
                            <TextField floatingLabelText="Test Input" type="text" style={{width:'100%'}} multiLine={true}
                                       value={this.state.testResult.testInput}/>
                            <div style={{width: '100%', color:'red'}}>
                                {(!(this.state.testResult.stdout))? <span>No test result. Maybe execution time exceeds the limitation?</span>:''}
                            </div>
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
                            <div style={{width:'100%', float:'left'}}>
                                <FlatButton label="Exit" secondary={true} onTouchTap={this.closeDialog.bind(this)} style={{left:'50%', marginLeft:'-50px'}}/>
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
    _userData: PropTypes.array.isRequired,
    currentUser: PropTypes.object,
    _sapporo: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('docker');
    Meteor.subscribe('userData');
    Meteor.subscribe('sapporo');
    return {
        _docker: docker.find({languages: true}).fetch(),
        _sapporo: sapporo.findOne({sapporo:true}),
        _userData: userData.find({}).fetch(),
        currentUser: Meteor.user()
    };
}, ProblemEditor);
