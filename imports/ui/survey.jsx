import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import ReactDOM from 'react-dom';

import Paper from 'material-ui/lib/paper';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import TextField from 'material-ui/lib/text-field';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import AddIcon from 'material-ui/lib/svg-icons/action/note-add';

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
        description: '會場方向指引清楚',
        value: null
    }, {
        description: '工作人員說明清楚',
        value: null
    }],
    otherQuestions: [{
        description: '本次活動身份',
        value: null,
        options: [{
            description: '參賽者', value: '參賽者'
        }, {
            description: '領隊', value: '領隊'
        }]
    }, {
        description: '如何得知此活動訊息',
        value: null,
        options: [{
            description: '網路', value: '網路'
        }, {
            description: '海報', value: '海報'
        }, {
            description: '學校網站(電子公布欄)', value: '學校'
        }, {
            description: '親友推薦', value: '親友'
        }, {
            description: '師長推薦', value: '老師'
        }, {
            description: '其他', value: '其他'
        }]
    }],
    textField: [{
        description: '姓名',
        value: null
    }, {
        description: '電話',
        value: null
    }, {
        description: '手機',
        value: null
    }]
};

export default class Survey extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newSurveyOpen: false,
            survey: surveyForm
        };
    }

    toggleNewSurveyDialog () {
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
    surveyAction (isSubmit) {
        if (isSubmit) {
            console.log(this.state.survey);
        }
        this.setState({
            survey: surveyForm
        });
        this.toggleNewSurveyDialog();
    }
    render () {

        const actions = [
            <FlatButton label="Cancel" primary={true} onTouchTap={this.surveyAction.bind(this, false)} />,
            <FlatButton label="Submit" primary={true} keyboardFocused={true} onTouchTap={this.surveyAction.bind(this, true)}/>
        ];

        return (
            <Paper style={{marginTop:'10px', padding:'10px'}}>
                <div>
                    <FlatButton label="New Survey" icon={<AddIcon />} onTouchTap={this.toggleNewSurveyDialog.bind(this)}/>
                </div>
                <List>

                </List>


                <Dialog title="" actions={actions} modal={false} open={this.state.newSurveyOpen} onRequestClose={this.toggleNewSurveyDialog.bind(this)}
                        autoScrollBodyContent={true}>
                    {this.renderQuestions()}
                    {this.renderOtherQuestions()}
                    {this.renderTextField()}
                </Dialog>
            </Paper>
        );
    }
}
