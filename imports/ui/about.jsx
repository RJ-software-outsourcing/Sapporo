import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import ReactDOM from 'react-dom';

import Paper from 'material-ui/lib/paper';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Avatar from 'material-ui/lib/Avatar';
import Subheader from 'material-ui/lib/Subheader';
import Dialog from 'material-ui/lib/dialog';

export default  class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openDialog: false,
            clickIndex: 0,
            techStack:[{
                name: 'Node.js',
                description: 'Node.js is the reason why JavaScript becomes popular today',
                avatar: '/images/tech/node_s.png',
                image: '/images/tech/node_l.png',
                content: 'Node.js is built on Chrome\'s V8 JavaScript engine. Traditionaly JavaScript is executed only inside of browser but with Node.js we can now run JavaScript directly under OS. Node.js also has the largest ecosystem of open source projects in the world.'
            }, {
                name: 'MeteorJS',
                description: 'JavaScript framework for building web, mobile and desktop application',
                avatar: '/images/tech/meteor_s.png',
                image: '/images/tech/meteor_l.png',
                content: 'MeteorJS is written using Node.js. It\'s a framework to build cross-platform apps (Web, iOS, Android, Desktop). MeteorJS received $11.2M funding from Andreessen Horowitz in 2012.'
            }, {
                name: 'React',
                description: 'JavaScript library for building User Interface',
                avatar: '/images/tech/react_s.png',
                image: '/images/tech/react_l.png',
                content: 'React is developed by Facebook. It\'s a JavaScript library to render data as HTML fast. React is used on websites like Netflix, Airbnb, Imgur, etc. React has become the #1 mentioned JS library in late 2016 and still climbing.'
            }, {
                name: 'Material UI',
                description: 'React UI modules based on Google\'s Material Design',
                avatar: '/images/tech/mdui_s.png',
                image: '/images/tech/mdui_l.png',
                content: 'Material UI are UI modules baed on React. It follows google\'s design pricinple (Material Design). It looks great.'
            }, {
                name: 'MongoDB',
                description: 'NoSQL database',
                avatar: '/images/tech/mongo_s.jpg',
                image: '/images/tech/mongo_l.png',
                content: 'MongoDB is one kind of NoSQL databases. '
            }, {
                name: 'Docker',
                description: 'Virtualization technology. It had changed the whole IT/Cloud industry.',
                avatar: '/images/tech/docker.png',
                image: '/images/tech/docker_l.png',
                content: 'Docker is the technology to create virtual environment. It\'s a game changer in IT/Cloud industry. All your code submission today are running inside of Docker\'s virtualized environment.'
            }]
        };
    }
    renderTechStack(){
        return this.state.techStack.map((item, key) => (
            <ListItem key={key} primaryText={item.name} secondaryText={item.description} onTouchTap={this.clickItem.bind(this, key)}
                      leftAvatar={<Avatar src={item.avatar} size={45} backgroundColor='white' style={{border:'0px solid white'}}/>}/>
        ));
    }
    toggleDialog(){
        this.setState({
            openDialog: !(this.state.openDialog)
        });
    }
    clickItem(key) {
        this.setState({
            clickIndex: key,
            openDialog: true
        });
    }
    render () {
        return (
            <Paper style={{marginTop:'10px'}}>
                <Subheader>About the system</Subheader>
                <div style={{width:'96%', marginLeft:'2%', marginBottom:'10px'}}>
                    <span>
                        This system is written entirely in JavaScript. JavaScript has become the most popular and fast-growing programming language nowadays.
                        With the power of JavaScript's ecosystem, we are able to build a modern system for CodeWars 2017.
                    </span>
                </div>
                <List>
                    <Subheader>We use the following to build our system</Subheader>
                    {this.renderTechStack()}
                </List>
                <Dialog modal={false} autoScrollBodyContent={true} open={this.state.openDialog} onRequestClose={this.toggleDialog.bind(this)}>
                        <div>
                            <img src={this.state.techStack[this.state.clickIndex].image} style={{height: '100px'}}/>
                        </div>
                        <div style={{marginTop:'10px'}}>
                            {this.state.techStack[this.state.clickIndex].content}
                        </div>
                </Dialog>
            </Paper>
        );
    }
}
