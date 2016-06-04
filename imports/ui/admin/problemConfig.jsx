import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { problem } from '../../api/db.js';

import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';

import ProblemIcon from 'material-ui/lib/svg-icons/editor/insert-comment';

const workaroundStyle = {marginTop: '30px', borderTop: '1px solid #DDD'};

const addStyle = {
    textAlign: 'center',
    marginTop: '20px'
};
const listStyle = {
    width: '80%',
    marginLeft: '10%'
};
const scoreStyle = {
    width: '100px',
    marginRight: '10px'
};
const titleStyle = {
    marginRight: '10px',
    width: '400px'
};
const inlineTestfield = {
    width: '50%'
};
const initState = {
    addScore : 0,
    addTitle : null,
    selectProblem : null
};
class ProblemConfig extends Component {
    constructor(props) {
        super(props);
        this.state = initState;
    }
    componentDidUpdate () {
    }
    updateAddScore (event) {
        this.setState({
            addScore: event.target.value
        });
    }
    updateAddTitle (event) {
        this.setState({
            addTitle: event.target.value
        });
    }
    renderProblems () {
        return this.props._problem.map((problem, key) => (
            <ListItem key={key} primaryText={problem.title} secondaryText={problem.score}
                      leftIcon={<ProblemIcon />} onTouchTap={this.clickProblem.bind(this, problem)} style={{borderBottom: '1px solid #DDD'}}/>
        ));
    }
    clickProblem (problem) {
        this.setState({
            selectProblem: problem
        });
    }
    addProblem () {
        Meteor.call('problem.add', {
            title: this.state.addTitle,
            score: this.state.addScore,
            verfication: [],
            images: []
        });
        this.setState(initState);
    }
    updateProblem (data) {
        Meteor.call('problem.update', data);
        this.setState(initState);
    }
    deleteProblem (data) {
        Meteor.call('problem.delete', data);
        this.setState(initState);
    }
    exitEditor () {
        this.setState(initState);
    }
    updateSelected (attr, event) {
        let temp = this.state.selectProblem;
        temp[attr] = event.target.value;
        this.setState({
            selectProblem : temp
        });
    }
    addVerificationCase () {
        let selected = this.state.selectProblem;
        selected.verfication.push({
            input: null,
            output: null
        });
        this.setState({
            selectProblem: selected
        });
    }
    updateVerificationCase (key, field, event) {
        let selected = this.state.selectProblem;
        selected.verfication[key][field] = event.target.value;
        this.setState({
            selectProblem : selected
        });
    }
    deleteVerificationCase (key) {
        let selected = this.state.selectProblem;
        selected.verfication.splice(key, 1);
        this.setState({
            selectProblem: selected
        });
    }
    renderVerification () {
        if (!this.state.selectProblem.verfication) {
            return;
        }
        return this.state.selectProblem.verfication.map((item, key) => (
            <div style={{marginTop:'20px', borderBottom: '1px solid #DDD'}} key={key}>
                <TextField type="text" floatingLabelText="Input" value={item.input}  name={key+'input'} multiLine={true} underlineShow={false}
                           onChange={this.updateVerificationCase.bind(this, key, 'input')} rows={1} rowsMax={1}/>
                       <TextField type="text" floatingLabelText="Output" value={item.output} name={key+'output'} multiLine={true} underlineShow={false}
                           onChange={this.updateVerificationCase.bind(this, key, 'output')} rows={1} rowsMax={1}/>
                <RaisedButton label="Delete" secondary={true} onTouchTap={this.deleteVerificationCase.bind(this, key)}/>
            </div>
        ));
    }
    renderImages () {
        if (!this.state.selectProblem.images) {
            return;
        }
        return this.state.selectProblem.images.map((item, key) => (
            <div key={key}>
                <img src={item.content} style={{height: '200px'}}/>
                <TextField type="text" placeholder="Title" name="title"
                           value={item.title} onChange={this.updateImageTitle.bind(this, key)}/>
                <RaisedButton label="Delete" secondary={true} onTouchTap={this.deleteImage.bind(this, key)}/>
            </div>
        ));
    }
    addImage (e) {
        let reader = new FileReader();
        let file = e.target.files;
        let selected = this.state.selectProblem;
        reader.onload = (upload)=>{
            selected.images.push({
                title: 'Figure ' + selected.images.length,
                content: upload.target.result
            });
            this.setState({
                selectProblem: selected
            });
        };
        reader.readAsDataURL(file[0]);
    }
    updateImageTitle (key, event) {
        let selected = this.state.selectProblem;
        selected.images[key].title = event.target.value;
        this.setState({
            selectProblem : selected
        });
    }
    deleteImage (key) {
        let selected = this.state.selectProblem;
        selected.images.splice(key, 1);
        this.setState({
            selectProblem: selected
        });
    }
    renderEditor () {
        let selected = this.state.selectProblem;
        return (
            <div style={{position: 'fixed', top:'0', left:'0',backgroundColor: 'rgba(0,0,0,0.7)',
                 width: '100%', height: '100vh', zIndex:'2000'}}>
                <div style={{position: 'fixed', top:'5vh', left:'5%', width: '85%', height: '85vh', padding:'2.5vh 2.5%',
                     backgroundColor:'white', zIndex:'2500', overflow:'scroll'}}>
                    <div>
                        <TextField type="number" min="0" placeholder="Score" name="number"
                                   style={scoreStyle} value={selected.score} onChange={this.updateSelected.bind(this, 'score')}/>
                        <TextField type="text" placeholder="Title" style={titleStyle} name="title"
                                   value={selected.title} onChange={this.updateSelected.bind(this, 'title')}/>
                        <RaisedButton label="Update" primary={true}   onTouchTap={this.updateProblem.bind(this, selected)}/>
                        <RaisedButton label="Cancel" onTouchTap={this.exitEditor.bind(this)}/>
                        <RaisedButton label="Delete" secondary={true} onTouchTap={this.deleteProblem.bind(this, selected)}/>
                    </div>
                    <div>
                        <TextField type="text" floatingLabelText="Problem Description" multiLine={true} value={selected.description} name="description"
                                   rows={2} rowsMax={4} underlineShow={false} style={{width: '100%'}} onChange={this.updateSelected.bind(this, 'description')}/>
                    </div>
                    <div style={workaroundStyle}>
                        <TextField type="text" floatingLabelText="Input Example" multiLine={true}  value={selected.exampleInput} name="exampleInput"
                                   rows={2} rowsMax={2} underlineShow={false} style={inlineTestfield} onChange={this.updateSelected.bind(this, 'exampleInput')}/>
                        <TextField type="text" floatingLabelText="Output Example" multiLine={true} value={selected.exampleOutput} name="exampleOutput"
                                   rows={2} rowsMax={2} underlineShow={false} style={inlineTestfield} onChange={this.updateSelected.bind(this, 'exampleOutput')}/>
                    </div>
                    <div style={workaroundStyle}>
                        <TextField type="text" floatingLabelText="Test Input" style={inlineTestfield} name="testInput" multiLine={true} underlineShow={false}
                                   value={selected.testInput} onChange={this.updateSelected.bind(this, 'testInput')} rows={1} rowsMax={1}/>
                        <TextField type="text" floatingLabelText="Test Output" style={inlineTestfield} name="testOutput" multiLine={true} underlineShow={false}
                                   value={selected.testOutput} onChange={this.updateSelected.bind(this, 'testOutput')} rows={1} rowsMax={1}/>
                    </div>
                    <div style={workaroundStyle}>
                        <RaisedButton label="Add Verifycation" primary={true} onTouchTap={this.addVerificationCase.bind(this)}/>
                        {this.renderVerification()}
                    </div>
                    <div style={{marginTop:'10px'}}>
                        <input type="file" onChange={this.addImage.bind(this)}/>
                        {this.renderImages()}
                    </div>
                </div>
            </div>
        );
    }
    render () {
        return (
            <div>
                <div style={addStyle}>
                    <TextField type="number" min="0" placeholder="Score" id="score"style={scoreStyle}
                               value={this.state.addScore} onChange={this.updateAddScore.bind(this)}/>
                    <TextField type="text" id="problemName" placeholder="Title" style={titleStyle}
                               value={this.state.addTitle} onChange={this.updateAddTitle.bind(this)}/>
                    <RaisedButton label="Add" primary={true} onTouchTap={this.addProblem.bind(this)}/>
                </div>
                <List style={listStyle}>
                    {this.renderProblems()}
                </List>
                {this.state.selectProblem? this.renderEditor():''}
            </div>
        );
    }
}

ProblemConfig.propTypes = {
    _problem: PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('problem');
    return {
        _problem: problem.find({}).fetch()
    };
}, ProblemConfig);
