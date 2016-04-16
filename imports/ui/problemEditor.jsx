import React, { Component, PropTypes} from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import Paper from 'material-ui/lib/paper';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import RaisedButton from 'material-ui/lib/raised-button';

import brace from 'brace';
import AceEditor from 'react-ace';

import * as langType from '../library/lang_import.js';
import * as themeType from '../library/theme_import.js';
import 'brace/theme/tomorrow_night_blue';

import { docker } from '../api/db.js';

const split = {
    width: '50%',
    display: 'inline-block'
};
const textDiv = {
    width: '96%',
    padding: '0px 2%'
};
let updateLock = false;
class ProblemEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            langType: null,
            theme: 'chaos',
            code: ''
        };
    }
    updateCode(code) {
        let tmpObj = {
            _id: this.props.data._id,
            code: code
        };
        localStorage.setItem(tmpObj._id, JSON.stringify(tmpObj));
        updateLock = false;
    }
    updateLang(event, index, value) {
        for (var key in this.props._docker.languages) {
            if (this.props._docker.languages[key].title === value) {
                this.setState({
                    language: value,
                    langType: this.props._docker.languages[key].langType
                });
            }
        }
    }
    renderLangOptions () {
        if (!this.props._docker) return;
        return this.props._docker.languages.map((lang, key) => (
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
        if (!updateLock) {
            let tmpObj = localStorage.getItem(this.props.data._id);
            if (tmpObj || tmpObj !== '') {
                tmpObj = JSON.parse(tmpObj);
                this.setState ({
                    code: tmpObj.code
                });
            }
            updateLock = true;
        }
        if (this.state.langType === null && this.props._docker) {
            let _docker = this.props._docker;
            if (_docker.languages && _docker.languages.length > 0) {
                this.setState({
                    langType: this.props._docker.languages[0].langType,
                    language: this.props._docker.languages[0].title
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
            updateLock = false;
        }
    }
    submitCode (isTest) {
        let tmpObj = JSON.parse(localStorage.getItem(this.props.data._id));
        let obj = {
            problemID: this.props.data._id,
            language: this.state.language,
            code: tmpObj.code,
            user: this.props.currentUser
        };
        Meteor.call('docker.submitCode', obj, isTest, function (err, result) {
            if (!err) {
                console.log(result);
            } else {
                alert(err);
            }
        });
    }
    render () {
        const  editorOption = {
            $blockScrolling: true
        };
        return (
            <div>
                <div style={{display:'inline-block', width: '100%', padding:'10px 0'}} >
                    <Paper style={{width: '49.5%', float:'left'}} zDepth={2}>
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
                                             floatingLabelText="Language" style={{width:'50%'}}>
                                             {this.renderLangOptions()}
                                </SelectField>
                                <SelectField value={this.state.theme} onChange={this.updateTheme.bind(this)}
                                             floatingLabelText="Theme" style={{width:'50%'}}>
                                             {this.renderThemeOptions()}
                                </SelectField>
                            </div>
                            <div style={{display:'inline-block', float:'right'}}>
                                <RaisedButton label="Test"    primary={true} onTouchTap={this.submitCode.bind(this, false)}/>
                                <RaisedButton label="Submit"  sencondary={true} onTouchTap={this.submitCode.bind(this, true)}/>
                            </div>
                        </div>
                        {this.state.langType?
                            <AceEditor mode={this.state.langType} theme={this.state.theme} onChange={this.updateCode.bind(this)} value={this.state.code} width='100%'
                                  name="UNIQUE_ID_OF_DIV" editorProps={editorOption} enableBasicAutocompletion={false} enableLiveAutocompletion={false}/>
                              :''
                        }

                    </div>
                </div>
                <span>{this.props.data._id}</span>
            </div>
        );
    }
}


ProblemEditor.propTypes = {
    _docker: PropTypes.object,
    currentUser: PropTypes.object,
};

export default createContainer(() => {
    Meteor.subscribe('docker');
    return {
        _docker: docker.findOne({docker: true}),
        currentUser: Meteor.user()
    };
}, ProblemEditor);
