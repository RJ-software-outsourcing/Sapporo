import React, { Component, PropTypes} from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import Paper from 'material-ui/lib/paper';
import TextField from 'material-ui/lib/text-field';
import DropDownMenu from 'material-ui/lib/DropDownMenu';
import MenuItem from 'material-ui/lib/menus/menu-item';

import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/java';
import 'brace/mode/javascript';
import 'brace/mode/c_cpp';
import 'brace/mode/python';
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
class ProblemEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            language: 'c_cpp'
        };
    }
    updateCode(code) {
        //console.log(code);
    }
    renderLangOptions () {

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
                            <DropDownMenu value={this.state.language}>
                                {this.renderLangOptions()}
                            </DropDownMenu>
                        </div>
                        <AceEditor mode={this.state.language} theme="tomorrow_night_blue" onChange={this.updateCode.bind(this)} width='100%'
                              name="UNIQUE_ID_OF_DIV" editorProps={editorOption} enableBasicAutocompletion={false} enableLiveAutocompletion={false}/>
                    </div>
                </div>
                <span>{this.props.data._id}</span>
            </div>
        );
    }
}


ProblemEditor.propTypes = {
    _docker: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('docker');
    return {
        _docker: docker.findOne({docker: true})
    };
}, ProblemEditor);
