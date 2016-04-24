import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import ToolbarTitle from 'material-ui/lib/toolbar/toolbar-title';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import LinearProgress from 'material-ui/lib/linear-progress';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import DeleteIcon from 'material-ui/lib/svg-icons/action/delete';
import IconButton from 'material-ui/lib/icon-button';

import { docker } from '../../api/db.js';
import { commandForTest } from '../../library/docker.js';

import brace from 'brace';
import * as langType from '../../library/lang_import.js';

const fieldStyle = {
    display: 'inline-block',
    width: '16.6%'
};

class DockerConfig extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogOpen: false,
            selectLang: null,
            runningTest: false
        };
    }
    closeAddDialog () {
        this.setState({
            dialogOpen: false,
            selectLang: null
        });
    }
    clickLang (lang) {
        this.setState({
            dialogOpen: true,
            selectLang: lang
        });
    }
    addLang () {
        this.setState({
            dialogOpen: true,
            selectLang: {
                mountPath:'/usr/src/myapp/'
            }
        });
    }
    updateLang () {
        Meteor.call('docker.add', this.state.selectLang, (err) => {
            if (err) {
                alert(err);
            }
            this.closeAddDialog();
        });
    }
    removeLang (lang) {
        Meteor.call('docker.remove', lang, (err) => {
            if (err) {
                alert(err);
            }
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
    deleteIcon (lang) {
        return (
            <IconButton touch={true} tooltip="delete" tooltipPosition="bottom-left" onTouchTap={this.removeLang.bind(this, lang)}>
                <DeleteIcon />
            </IconButton>
        );
    }
    renderLanguages () {
        return this.props._dockerLangs.map((lang, key) => (
            <ListItem key={key} primaryText={lang.title} secondaryText={lang.image} rightIconButton={this.deleteIcon(lang)}
                      onTouchTap={this.clickLang.bind(this, lang)} style={{borderBottom: '1px solid #DDD'}}/>
        ));
    }
    updateLangState (field, event) {
        let temp = this.state.selectLang;
        temp[field] = event.target.value;
        this.setState({
            selectLang : temp
        });
    }
    updateLangType (event, index, value) {
        let temp = this.state.selectLang;
        temp['langType'] = value;
        this.setState({
            selectLang: temp
        });
    }
    showCommandLine (lang) {
        let strArray = commandForTest(lang);
        return '/bin/bash -c "' + strArray.join(' ') + '"';
    }
    startTesting () {
        this.setState({runningTest: true});
        Meteor.call('docker.checkImage', (err, result) => {
            if (err) {
                alert(err);
            } else {
                for (var key in result) {
                    if (!result[key].find) {
                        alert(result[key].image + ' not found, abort.');
                        this.setState({runningTest: false});
                        return;
                    }
                }
                alert('All images found! Ready to run them');
                Meteor.call('docker.testImage', (err, result) => {
                    if (err) {
                        alert(err);
                    } else {
                        for (var key in result) {
                            alert(result[key].title + ' : ' + result[key].output);
                        }
                    }
                    this.setState({runningTest: false});
                });
            }
        });
    }
    render () {
        const actions = [
            <FlatButton label="Cancel" secondary={true} onTouchTap={this.closeAddDialog.bind(this)}/>,
            <FlatButton label="Submit" primary={true}   onTouchTap={this.updateLang.bind(this, null)}/>
        ];
        return (
            <div style={{}}>
                <div>
                    <TextField type="text" id="IP address"  floatingLabelText="IP address"/>
                    <TextField type="text" id="port" floatingLabelText="Port number"/>
                    <RaisedButton label="Check Connection" primary={true} />
                    <RaisedButton label="Test" secondary={true} onTouchTap={this.startTesting.bind(this)}/>
                </div>
                <div>
                    <Toolbar style={{marginTop:'30px'}}>
                        <ToolbarGroup float="left">
                            <ToolbarTitle text="Language Configuration" />
                            <RaisedButton label="Add" onTouchTap={this.addLang.bind(this)}/>
                        </ToolbarGroup >
                        <ToolbarGroup float="right">

                        </ToolbarGroup >
                    </Toolbar>
                    <List>
                        {this.renderLanguages()}
                    </List>

                </div>
                {this.state.selectLang?
                    <Dialog title="Programming Language Configuration" actions={actions} modal={false} autoScrollBodyContent={true} contentStyle={{width:'90%', maxWidth:'100%'}}
                            open={this.state.dialogOpen} onRequestClose={this.closeAddDialog.bind(this)} autoDetectWindowHeight={true}>
                        <div>
                            <SelectField  value={this.state.selectLang.langType}  onChange={this.updateLangType.bind(this)}
                                          floatingLabelText="Language Family" style={{top:'-8px'}}>{this.renderLangOptions()}</SelectField>
                            <TextField type="text" value={this.state.selectLang.title} floatingLabelText="Language Name" onChange={this.updateLangState.bind(this, 'title')} />
                            <TextField type="text" value={this.state.selectLang.image} floatingLabelText="Docker Image"  onChange={this.updateLangState.bind(this, 'image')}/>
                            <TextField type="text" value={this.state.selectLang.mountPath} floatingLabelText="Mounted Path on Docker" onChange={this.updateLangState.bind(this, 'mountPath')} />
                        </div>
                        <div>
                            <TextField type="text" value={this.state.selectLang.executable} floatingLabelText="Executable" onChange={this.updateLangState.bind(this, 'executable')} style={fieldStyle}/>
                            <TextField type="text" value={this.state.selectLang.preArg} floatingLabelText="Args_1" onChange={this.updateLangState.bind(this, 'preArg')} style={fieldStyle}/>
                            <TextField type="text" value={this.state.selectLang.file} floatingLabelText="File Name" onChange={this.updateLangState.bind(this, 'file')} style={fieldStyle}/>
                            <TextField type="text" value={this.state.selectLang.middleArg} floatingLabelText="Args_2" onChange={this.updateLangState.bind(this, 'middleArg')} style={fieldStyle}/>
                            <TextField type="text" value={this.state.selectLang.testInput} floatingLabelText="Test Input" onChange={this.updateLangState.bind(this, 'testInput')} style={fieldStyle}/>
                            <TextField type="text" value={this.state.selectLang.postArg} floatingLabelText="Args_3" onChange={this.updateLangState.bind(this, 'postArg')} style={fieldStyle}/>
                            <span style={{float:'right'}}>{this.showCommandLine(this.state.selectLang)}</span>
                        </div>
                        <div>
                            <TextField type="text" value={this.state.selectLang.helloworld} floatingLabelText="Testing Script" onChange={this.updateLangState.bind(this, 'helloworld')} multiLine={true} style={{width:'50%'}}/>
                        </div>

                    </Dialog>
                :''
                }
                <Dialog title="Runnung Test..." modal={false} open={this.state.runningTest} >
                    <LinearProgress />
                </Dialog>
            </div>
        );
    }
}

DockerConfig.propTypes = {
    _dockerGlobal: PropTypes.object,
    _dockerLangs:  PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('docker');
    return {
        _dockerGlobal: docker.findOne({global: true}),
        _dockerLangs:  docker.find({languages: true}).fetch()

    };
}, DockerConfig);
