import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { createContainer } from 'meteor/react-meteor-data';
import { batchAccount } from '../../api/db.js';
import {goPage} from '../goPage.js';

import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';

class BatchAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            batchTotal: 0,
            accountPrefix: 'team'
        };
    }
    updateBatchData (field, event) {
        let state = this.state;
        state[field] = event.target.value;
        this.setState(state);
    }
    batchCreate () {
        for (var key =0; key < this.state.batchTotal; key++) {
            let username = this.state.accountPrefix + '_' + key.toString();
            let password =  Random.id();
            Meteor.call('user.batchCreate', username, password ,function (err) {
                if (err) {
                    alert(username + ': ' + err.reason);
                }
            });
        }
    }
    removeAll() {
        goPage('login');
        Meteor.call('user.removeAll', function (err) {
            if (err) {
                alert(err);
            }
        });
    }
    renderBatchAccounts () {
        return this.props._batchAccount.map((item, key) => {
            return (<ListItem key={key} primaryText={item.username} secondaryText={item.password} />);
        });
    }
    render () {
        return (
            <div>
                <div>
                    <TextField type="text" id="accountName" floatingLabelText="Account Prefix"
                               value={this.state.accountPrefix} onChange={this.updateBatchData.bind(this, 'accountPrefix')}/>
                    <TextField type="number" min="0" floatingLabelText="Total"
                               value={this.state.batchTotal} onChange={this.updateBatchData.bind(this, 'batchTotal')} id="batchTotal"/>
                    <RaisedButton label="Create" primary={true} onTouchTap={this.batchCreate.bind(this)}/>
                </div>
                <div>
                    <h5>Batch created accounts</h5>
                    <List>
                        {this.renderBatchAccounts()}
                    </List>
                </div>
                <div>
                    <RaisedButton label="Remove All User Data" secondary={true} onTouchTap={this.removeAll.bind(this)}/>
                </div>
            </div>
        );
    }
}

BatchAccount.propTypes = {
    _batchAccount: PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('batchAccount');
    return {
        _batchAccount: batchAccount.find({}).fetch()
    };
}, BatchAccount);
