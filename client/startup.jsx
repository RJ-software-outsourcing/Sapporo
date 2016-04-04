import React, { Component } from 'react'
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import Main from '../imports/ui/main.jsx';

Meteor.startup(() => {
    let element = document.getElementById('main');
    render(React.createElement(Main), element);
});
