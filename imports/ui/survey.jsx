import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { survey } from '../api/db.js';

import Paper from 'material-ui/lib/paper';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import TextField from 'material-ui/lib/text-field';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import AddIcon from 'material-ui/lib/svg-icons/action/note-add';
import Divider from 'material-ui/lib/divider';

const questionSelection = [{
    description: '非常不同意',
    value: 0
}, {
    description: '不同意',
    value: 1
}, {
    description: '普通',
    value: 2
}, {
    description: '同意',
    value: 3
}, {
    description: '非常同意',
    value: 4
}];


const surveyForm = {
    questions:[{
        description: '您相信世界上有外星人嗎?',
        value: null
    }, {
        description: '您相信努力就一定有回報嗎?',
        value: null
    }],
    otherQuestions: [{
        description: '下列哪個是賭聖的電話號碼?',
        value: null,
        options: [{
            description: '香港948794狂', value: '香港948794狂'
        }, {
            description: '香港3345678', value: '香港3345678'
        }]
    }, {
        description: '如何得知此活動訊息',
        value: null,
        options: [{
            description: '夢到的', value: '夢到的'
        }, {
            description: '不小心走錯房間', value: '不小心走錯房間'
        }, {
            description: '恩? 什麼活動?', value: '恩? 什麼活動?'
        }]
    }],
    textField: [{
        description: '猴子最討厭什麼線？',
        value: null
    }, {
        description: '什麼情況下2大於5，5大於0，0大於2呢？',
        value: null
    }, {
        description: '小明踩到大便，為什麼沒弄髒鞋子?',
        value: null
    }],
    suggestion: null
};

class Survey extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newSurveyOpen: false,
            survey: surveyForm,
            editID: null,
            surveyFound: [],
            findName: null
        };
    }

    toggleNewSurveyDialog (clearSurvey) {
        if (clearSurvey) {
            this.setState({
                survey: surveyForm,
                editID: null
            });
        }
        this.setState({
            newSurveyOpen: !(this.state.newSurveyOpen)
        });
    }
    renderOptions (selections) {
        return selections.map((item, key)=>{
            return (
                <MenuItem key={key} value={item.value} primaryText={item.description}/>
            );
        });
    }
    updateSurvey(field, key, event, index, value){
        let tmp = this.state.survey;
        tmp[field][key].value = value;
        this.setState({
            survey: tmp
        });
    }
    renderQuestions() {
        return this.state.survey.questions.map((item, key)=>{
            return (
                <div key={key} style={{width:'100%'}}>
                    <SelectField style={{width:'100%'}}  floatingLabelText={item.description} value={item.value} onChange={this.updateSurvey.bind(this, 'questions', key)}>
                        {this.renderOptions(questionSelection)}
                    </SelectField>
                </div>
            );
        });
    }
    renderOtherQuestions(){
        return this.state.survey.otherQuestions.map((item, key)=>{
            return (
                <div key={key} >
                    <SelectField style={{width:'100%'}} floatingLabelText={item.description} value={item.value} onChange={this.updateSurvey.bind(this, 'otherQuestions', key)}>
                        {this.renderOptions(item.options)}
                    </SelectField>
                </div>
            );
        });
    }
    updateSurveyTextField (key, event) {
        let tmp = this.state.survey;
        tmp.textField[key].value = event.target.value;
        this.setState({
            survey: tmp
        });
    }
    renderTextField(){
        return this.state.survey.textField.map((item, key)=>{
            return (
                <div key={key}>
                    <TextField style={{width:'100%'}} floatingLabelText={item.description} value={item.value} onChange={this.updateSurveyTextField.bind(this, key)} />
                </div>
            );
        });
    }
    updateSuggestion (event) {
        let tmp = this.state.survey;
        tmp.suggestion = event.target.value;
        this.setState({
            survey: tmp
        });
    }
    surveyAction (isSubmit) {
        if (isSubmit) {
            //console.log(this.state.survey);
            Meteor.call('survey.submit', this.state.survey, this.state.editID, (error)=>{
                if (error) {
                    alert(error);
                }
            });
        }
        this.toggleNewSurveyDialog(true);

    }
    editSurvey (item) {
        this.setState({
            survey: item.survey,
            editID: item._id
        });
        this.toggleNewSurveyDialog();
    }
    renderSurveys () {
        if (this.props._surveyData) {
            return this.props._surveyData.map((item, key)=> {
                return (
                    <ListItem key={key} primaryText={item.createdAt.toString()} onTouchTap={this.editSurvey.bind(this, item)}/>
                );
            });
        }
    }
    updateFindUser (event) {
        this.setState({
            findName: event.target.value
        });
    }
    findUserSurvey(){
        Meteor.call('survey.search', this.state.findName, (err, data)=> {
            if (err) {
                alert(err);
            }
            this.setState({
                surveyFound: data
            });
        });
    }
    renderFind(){
        return this.state.surveyFound.map((item, key)=>{
            return (
                <ListItem key={key} primaryText={item.createdAt.toString()} onTouchTap={this.editSurvey.bind(this, item)}/>
            );
        });
    }

    render () {

        const actions = [
            <FlatButton label="Cancel" secondary={true} onTouchTap={this.surveyAction.bind(this, false)} />,
            <FlatButton label="Submit" primary={true} keyboardFocused={true} onTouchTap={this.surveyAction.bind(this, true)}/>
        ];

        return (
            <Paper style={{marginTop:'10px', padding:'10px'}}>
                {
                    this.props.currentUser.username === 'admin'?
                    <div>
                        <TextField floatingLabelFixed={true} floatingLabelText="search user name" value={this.state.findname} onChange={this.updateFindUser.bind(this)} />
                        <FlatButton label="Find" primary={true} onTouchTap={this.findUserSurvey.bind(this)} />
                        <List>
                            {this.renderFind()}
                        </List>
                        <Divider />
                    </div>
                    :''
                }
                <div>
                    <FlatButton label="New Survey" icon={<AddIcon />} onTouchTap={this.toggleNewSurveyDialog.bind(this, true)}/>
                </div>
                <List>
                    {this.renderSurveys()}
                </List>


                <Dialog title="" actions={actions} modal={false} open={this.state.newSurveyOpen} onRequestClose={this.toggleNewSurveyDialog.bind(this, true)}
                        autoScrollBodyContent={true}>
                    {this.renderQuestions()}
                    {this.renderOtherQuestions()}
                    {this.renderTextField()}
                    <TextField style={{width:'100%'}} floatingLabelText='對這次的活動是否有什麼建議呢?' multiLine={true} rows={5}
                               value={this.state.survey.suggestion} onChange={this.updateSuggestion.bind(this)} />
                </Dialog>
            </Paper>
        );
    }
}

Survey.propTypes = {
    _surveyData: PropTypes.array.isRequired,
    currentUser: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('survey');
    return {
        currentUser: Meteor.user(),
        _surveyData: survey.find({user: Meteor.user().username}).fetch()
    };
}, Survey);
