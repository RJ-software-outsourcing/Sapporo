import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';
import Paper from 'material-ui/lib/paper';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';

import { liveFeed } from '../../api/db.js';

const dateOption = {
    weekday: 'long', year: 'numeric', month: 'short',
    day: 'numeric', hour: '2-digit', minute: '2-digit'
};

class LiveFeed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogOpen: false
        };
    }
    updateField (field, event) {
        let tmp = this.state;
        tmp[field] = event.target.value;
        this.setState(tmp);
    }
    sendLiveFeed () {
        Meteor.call('liveFeed.add', {
            title: this.state.title,
            content: this.state.content
        }, (err) => {
            if (err) {
                alert(err);
            }
        });
        this.setState({
            title:  '',
            content: ''
        });
    }
    renderLiveFeeds () {
        return this.props._liveFeed.map((item, key) => (
            <ListItem key={key} primaryText={item.title} secondaryText={item.content} onTouchTap={this.openFeed.bind(this, item)}/>
        ));
    }
    openFeed (item) {
        this.setState({
            dialogOpen: true,
            clickFeed: item
        });
    }
    closeFeed () {
        this.setState({
            dialogOpen: false,
            clickFeed: null
        });
    }
    deleteFeed () {
        Meteor.call('liveFeed.delete', this.state.clickFeed, function (err) {
            if (err) {
                alert(err);
            }
        });
        this.closeFeed();
    }
    render () {
        const actions = [
            <FlatButton label="delete" secondary={true} onTouchTap={this.deleteFeed.bind(this)}/>,
            <FlatButton label="exit" primary={true} onTouchTap={this.closeFeed.bind(this)} />
        ];
        return (
            <div>
                <div style={{width: '49%', float:'left'}}>
                    <TextField type="text" floatingLabelText="Title" name="title" style={{width: '100%'}}
                               onChange={this.updateField.bind(this, 'title')} value={this.state.title}/>
                    <TextField type="text" floatingLabelText="Content" style={{width: '100%'}}
                               multiLine={true} name="content" rows={4} value={this.state.content}
                               onChange={this.updateField.bind(this, 'content')}/>
                    <RaisedButton label="Send" primary={true} onTouchTap={this.sendLiveFeed.bind(this)}/>
                </div>
                <Paper style={{width: '49%', float:'right', marginTop: '10px'}} zDepth={1}>
                    <List>
                        {this.renderLiveFeeds()}
                    </List>
                </Paper>
                {this.state.clickFeed?
                    <Dialog title={this.state.clickFeed.title} actions={actions} modal={false}
                            open={this.state.dialogOpen} onRequestClose={this.closeFeed.bind(this)}>
                        <h5>{this.state.clickFeed.date_created.toLocaleTimeString('en-us', dateOption)}</h5>
                        <textArea value={this.state.clickFeed.content} style={{width:'100%', height:'200px'}} readOnly={true}></textArea>
                    </Dialog>
                :''
                }

            </div>
        );
    }
}

LiveFeed.propTypes = {
    _liveFeed: PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('liveFeed');
    return {
        _liveFeed: liveFeed.find({}, {sort: {date_created: -1}}).fetch()
    };
}, LiveFeed);
