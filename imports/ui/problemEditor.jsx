import React, { Component } from 'react';
import Paper from 'material-ui/lib/paper';
import TextField from 'material-ui/lib/text-field';

const split = {
    width: '50%',
    display: 'inline-block'
};
const textDiv = {
    width: '96%',
    padding: '0px 2%'
};
export default class ProblemEditor extends Component {
    render () {
        return (
            <div style={{display:'inline-block', width: '100%', padding:'10px 0'}} >
                <Paper style={split} zDepth={2}>
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
                <div style={split}>
                    f
                </div>
            </div>
        );
    }
}
