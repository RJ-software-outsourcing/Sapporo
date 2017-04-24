import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { timer } from '../api/db.js';
import { survey } from '../api/db.js';
import { timeSchedule } from '../library/timeLib.js';

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
        description: '會場方向指引清楚明瞭',
        value: null
    }, {
        description: '比賽流程及規則說明清楚詳細',
        value: null
    }, {
        description: '比賽過程中有疑問或需要協助時,工作人員能及時予以協助 ',
        value: null
    }, {
        description: '活動時間安排適宜',
        value: null
    }, {
        description: '比賽場地 (交通便利,場地大小, 照明.. ) ',
        value: null
    }, {
        description: '餐點安排',
        value: null
    }, {
        description: '我覺得試題整體來說難易適中',
        value: null
    }, {
        description: '我會推薦這個活動訊息給我的朋友',
        value: null
    }, {
        description: '我覺得參加這次活動對未來就業/升學有所幫助',
        value: null
    }, {
        description: '這次活動讓我對HPE/HPI有更深入的了解',
        value: null
    }, {
        description: '下次舉辦Codewars活動我願意再參加',
        value: null
    }, {
        description: '整體而言，我對這次比賽活動感到滿意',
        value: null
    }],
    otherQuestions: [{
        description: '本次參加活動身分?',
        value: null,
        options: [{
            description: '領隊', value: '領隊'
        }, {
            description: '參賽者', value: '參賽者'
        }]
    }, {
        description: '如何得知此活動訊息',
        value: null,
        options: [{
            description: '網路', value: '網路'
        }, {
            description: '海報', value: '海報'
        }, {
            description: '學校網站(電子公佈欄)', value: '學校網站(電子公佈欄)'
        }, {
            description: '親友推薦', value: '親友推薦'
        }, {
            description: '師長推薦', value: '師長推薦'
        }, {
            description: '其他', value: '其他'
        }]
    }],
    textField: [{
        description: '姓名/電話/e-mail',
        value: null
    }],
    suggestion: null
};

class Survey extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newSurveyOpen: false,
            survey: JSON.parse(JSON.stringify(surveyForm)),
            editID: null,
            surveyFound: [],
            findName: null
        };
    }

    toggleNewSurveyDialog (clearSurvey) {
        if (clearSurvey) {
            this.setState({
                survey: JSON.parse(JSON.stringify(surveyForm)),
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
                    <ListItem key={key} primaryText={item.user + ' (' + (key + 1).toString() + ')'}
                            secondaryText={item.createdAt.toString()} onTouchTap={this.editSurvey.bind(this, item)}/>
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
                <ListItem key={key} primaryText={item.user + ' (' + (key + 1).toString() + ')'}
                        secondaryText={item.createdAt.toString()} onTouchTap={this.editSurvey.bind(this, item)}/>
            );
        });
    }

    render () {

        const actions = [
            <FlatButton label="Cancel" secondary={true} onTouchTap={this.surveyAction.bind(this, false)} />,
            <FlatButton label="Submit" primary={true} keyboardFocused={true} onTouchTap={this.surveyAction.bind(this, true)}/>
        ];

        const schedule = timeSchedule(this.props._timer.systemTime, this.props._timer.start, this.props._timer.end);

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

                {
                    (schedule.start && schedule.end)? (
                        <div>
                            <div>
                                {
                                    (this.props._surveyData.length < 3)? <FlatButton label="New Survey" icon={<AddIcon />} onTouchTap={this.toggleNewSurveyDialog.bind(this, true)}/> : null
                                }
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
                        </div>
                    ) : (
                        <div>
                            問卷將在比賽結束後開放...
                        </div>
                    )
                }

            </Paper>
        );
    }
}

Survey.propTypes = {
    _surveyData: PropTypes.array.isRequired,
    currentUser: PropTypes.object,
    _timer: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('survey');
    Meteor.subscribe('timer');
    return {
        currentUser: Meteor.user(),
        _surveyData: survey.find({user: Meteor.user().username}).fetch(),
        _timer: timer.findOne({timeSync: true})
    };
}, Survey);
