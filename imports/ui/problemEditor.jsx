import React, { Component, PropTypes} from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import Paper from 'material-ui/lib/paper';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';

import brace from 'brace';
import AceEditor from 'react-ace';

import * as langType from '../library/lang_import.js';
import * as themeType from '../library/theme_import.js';
import 'brace/theme/tomorrow_night_blue';
//console.log(lang);

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
        var initLang = '';
        for (var key in langType) {
            if (key !== '__esModule') {
                initLang = key;
                break;
            }
        }
        this.state = {
            language: initLang,
            theme: 'chaos'
        };
    }
    updateCode(code) {
        //console.log(code);
    }
    updateLang(event, index, value) {
        this.setState({
            language: value
        });
    }
    renderLangOptions () {
        let langList = [];
        for (var key in langType) {
            if (key !== '__esModule') {
                langList.push(key);
            }
        }
        return langList.map((lang, key) => (
            <MenuItem key={key} value={lang} primaryText={lang}></MenuItem>
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
                            <SelectField value={this.state.language} onChange={this.updateLang.bind(this)}
                                         floatingLabelText="Choose A Language" style={{}}>
                                         {this.renderLangOptions()}
                            </SelectField>
                            <SelectField value={this.state.theme} onChange={this.updateTheme.bind(this)}
                                         floatingLabelText="Theme" style={{}}>
                                         {this.renderThemeOptions()}
                            </SelectField>
                        </div>
                        <AceEditor mode={this.state.language} theme={this.state.theme} onChange={this.updateCode.bind(this)} width='100%'
                              name="UNIQUE_ID_OF_DIV" editorProps={editorOption} enableBasicAutocompletion={false} enableLiveAutocompletion={false}/>
                    </div>
                </div>
                <span>{this.props.data._id}</span>
            </div>
        );
    }
}


ProblemEditor.propTypes = {

};

export default createContainer(() => {
    //Meteor.subscribe('docker');
    return {

    };
}, ProblemEditor);
