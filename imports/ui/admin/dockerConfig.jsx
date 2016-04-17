import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import ToolbarTitle from 'material-ui/lib/toolbar/toolbar-title';
import Divider from 'material-ui/lib/divider';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import LinearProgress from 'material-ui/lib/linear-progress';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';

import { docker } from '../../api/db.js';
import { commandForTest } from '../../library/docker.js';
import brace from 'brace';
import * as langType from '../../library/lang_import.js';

const langField = {
    display: 'inline-block',
    width: '25%'
};
const defaultDocker = {
    ip: '',
    port: '',
    languages: []
};
let updateDockerLock = false;

class DockerConfig extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addDialogOpen: false,
            docker: defaultDocker
        };
        updateDockerLock = false;
    }
    addNewLang () {
        Meteor.call('docker.add', this.state.add, () => {
            this.setState({
                docker:defaultDocker
            });
            this.closeAddDialog();
        });
    }
    removeLang (key) {
        Meteor.call('docker.remove', key, () => {
            this.setState({docker:defaultDocker});
            updateDockerLock = false;
        });
    }
    updateAll () {
        updateDockerLock = false;
        Meteor.call('docker.update', this.state.docker, (err)=>{
            (err)? alert('Update Failed'):alert('Update Success');
        });
    }
    componentDidMount () {
        updateDockerLock = false;
    }
    componentDidUpdate () {
        if (!updateDockerLock) this.updateDocker();
    }
    updateDocker () {
        if (this.props._docker) {
            this.setState({
                docker: this.props._docker
            });
            updateDockerLock = true;
        }
    }
    updateLang (key, attr, event) {
        let temp = this.state.docker;
        temp.languages[key][attr] = event.target.value;
        this.setState({
            docker: temp
        });
    }
    updateType (key, event, index, value) {
        let temp = this.state.docker;
        temp.languages[key]['langType'] = value;
        this.setState({
            docker: temp
        });
    }
    updateAdd (attr, event) {
        let temp = this.state.add;
        temp[attr] = event.target.value;
        this.setState({
            add: temp
        });
    }
    showCommandLine (lang) {
        let strArray = commandForTest(lang);
        return strArray.join(' ');
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
    renderLanguages () {
        if (!this.state.docker.languages) {
            return;
        }
        return this.state.docker.languages.map((language, key) => (
            <div key={key} style={{width: '100%', marginTop: '30px'}}>
                <div>
                    <TextField type="text" value={language.title} floatingLabelText="Programming Language" onChange={this.updateLang.bind(this, key, 'title')}/>
                    <TextField type="text" value={language.image} floatingLabelText="Docker Image (repo:tag)" onChange={this.updateLang.bind(this, key, 'image')} />
                    <SelectField value={language.langType}  onChange={this.updateType.bind(this, key)}
                                 floatingLabelText="Language Family" style={{top:'-8px'}}>{this.renderLangOptions()}</SelectField>
                    <RaisedButton label="Remove" secondary={true} style={{margin: '20px 0px 0px', float: 'right'}} onTouchTap={this.removeLang.bind(this, key)}/>
                </div>
                <div style={{width: '100%'}}>
                    <TextField type="text" style={langField} value={language.executable} floatingLabelText="Executable" onChange={this.updateLang.bind(this, key, 'executable')} />
                    <TextField type="text" style={langField} value={language.preArg} floatingLabelText="Args Before Input File (Optional)" onChange={this.updateLang.bind(this, key, 'preArg')} />
                    <TextField type="text" style={langField} value={language.mountPath} floatingLabelText="Mounted Path on Docker" onChange={this.updateLang.bind(this, key, 'mountPath')} />
                    <TextField type="text" style={langField} value={language.postArg} floatingLabelText="Args After Input File (Optional)" onChange={this.updateLang.bind(this, key, 'postArg')} />
                </div>
                <div>
                    <span style={{float:'right'}}>{this.showCommandLine(language)}</span>
                </div>
                <div>
                    <TextField type="text" style={{width:'100%'}} value={language.helloworld} floatingLabelText="Testing Script" hintText="Write script which prints 'helloworld' for testing"
                               onChange={this.updateLang.bind(this, key, 'helloworld')} rows={2} rowsMax={2} multiLine={true}/>
                </div>

            </div>
        ));
    }
    openAddDialog () {
        this.setState({
            addDialogOpen: true,
            add: {
                title: null,
                image: null,
                executable: null,
                mountPath: '/usr/src/myapp/'
            }
        });
    }
    closeAddDialog () {
        this.setState({
            addDialogOpen: false
        });
        updateDockerLock = false;
    }
    startTesting () {
        this.setState({runTest: true});
        Meteor.call('docker.checkImage', (err, result) => {
            if (err) {
                alert(err);
            } else {
                for (var key in result) {
                    if (!result[key].find) {
                        alert(result[key].image + ' not found, abort.');
                        this.setState({runTest: false});
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
                });
            }
        });
    }
    abortTest () {
        this.setState({
            runTest: false
        });
    }
    render () {
        const actions = [
            <FlatButton label="Cancel" secondary={true} onTouchTap={this.closeAddDialog.bind(this)}/>,
            <FlatButton label="Submit" primary={true}   onTouchTap={this.addNewLang.bind(this)}/>
        ];
        const testActions = [
            <FlatButton label="Abort" secondary={true} onTouchTap={this.abortTest.bind(this)}/>
        ];
        return (
            <div style={{}}>
                <div>
                    <TextField type="text" id="IP address" value={this.state.docker.ip} floatingLabelText="IP address"/>
                    <TextField type="text" id="port" value={this.state.docker.port} floatingLabelText="Port number"/>
                    <RaisedButton label="Update" primary={true} onTouchTap={this.updateAll.bind(this)}/>
                    <RaisedButton label="Test" secondary={true} onTouchTap={this.startTesting.bind(this)}/>
                </div>
                <div>
                    <Toolbar style={{marginTop:'30px'}}>
                        <ToolbarGroup float="left">
                            <ToolbarTitle text="Language Configuration" />
                            <RaisedButton label="Add" onTouchTap={this.openAddDialog.bind(this)}/>
                        </ToolbarGroup >
                        <ToolbarGroup float="right">

                        </ToolbarGroup >
                    </Toolbar>
                    {this.renderLanguages()}
                </div>
                {this.state.add?
                    <Dialog title="Add New Language Support" actions={actions} modal={false}
                            open={this.state.addDialogOpen} onRequestClose={this.closeAddDialog.bind(this)}>
                        <div>
                            <TextField type="text" value={this.state.add.title} floatingLabelText="Programming Language" onChange={this.updateAdd.bind(this, 'title')}/>
                            <TextField type="text" value={this.state.add.image} floatingLabelText="Docker Image"         onChange={this.updateAdd.bind(this, 'image')}/>
                            <TextField type="text" value={this.state.add.executable} floatingLabelText="Executable"      onChange={this.updateAdd.bind(this, 'executable')}/>
                        </div>
                    </Dialog>
                :''
                }
                {this.state.runTest?
                    <Dialog title="Running Docker testing...." actions={testActions} modal={false}
                            open={this.state.runTest} onRequestClose={this.abortTest.bind(this)}>
                        <LinearProgress mode="indeterminate"/>
                        <div>

                        </div>

                    </Dialog>
                :''
                }
            </div>
        );
    }
}

DockerConfig.propTypes = {
    _docker: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('docker');
    return {
        _docker: docker.findOne({docker: true})
    };
}, DockerConfig);
