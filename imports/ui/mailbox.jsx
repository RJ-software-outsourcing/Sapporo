import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import Paper from 'material-ui/lib/paper';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import MailIcon from 'material-ui/lib/svg-icons/content/mail';
import ReadIcon from 'material-ui/lib/svg-icons/content/drafts';

import { liveFeed } from '../api/db.js';
import { setMailAsRead, isMailRead } from '../library/mail.js';

const dateOption = {
    weekday: 'long', year: 'numeric', month: 'short',
    day: 'numeric', hour: '2-digit', minute: '2-digit'
};

class Mailbox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogOpen: false
        };
    }
    renderLiveFeeds () {
        return this.props._liveFeed.map((item) => (
            <div>
                <ListItem key={item._id} primaryText={item.title} secondaryText={item.date_created.toLocaleTimeString()}
                          onTouchTap={this.openFeed.bind(this, item)} leftIcon={this.hasRead(item)}/>
            </div>
        ));
    }
    hasRead (item) {
        return isMailRead(item)? <ReadIcon/>:<MailIcon />;
    }
    openFeed (item) {
        this.setState({
            dialogOpen: true,
            clickFeed: item
        });
        setMailAsRead(item);
    }
    closeFeed () {
        this.setState({
            dialogOpen: false,
            clickFeed: null
        });
    }
    render () {
        const actions = [
            <FlatButton label="exit" primary={true} onTouchTap={this.closeFeed.bind(this)} />
        ];
        return (
            <Paper style={{marginTop:'10px'}}>
                    <List>
                        {this.renderLiveFeeds()}
                    </List>

                {this.state.clickFeed?
                    <Dialog title={this.state.clickFeed.title} actions={actions} modal={false}
                            open={this.state.dialogOpen} onRequestClose={this.closeFeed.bind(this)}>
                        <h5>{this.state.clickFeed.date_created.toLocaleTimeString('en-us', dateOption)}</h5>
                        <textArea value={this.state.clickFeed.content} style={{width:'100%', height:'200px', maxHeight:'200px', border:'none'}} readOnly={true}></textArea>
                    </Dialog>
                :''
                }

            </Paper>
        );
    }
}

Mailbox.propTypes = {
    _liveFeed: PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('liveFeed');
    return {
        _liveFeed: liveFeed.find({}, {sort: {date_created: -1}}).fetch()
    };
}, Mailbox);
