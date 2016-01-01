AccountsUIWrapper = React.createClass({
  componentDidMount() {
    // Use Meteor Blaze to render login buttons
    this.view = Blaze.render(Template.loginButtons,
      React.findDOMNode(this.refs.container));
  },
  componentWillUnmount() {
    // Clean up Blaze view
    Blaze.remove(this.view);
  },
  render() {
    // Just render a placeholder container that will be filled in
    return <div className="AccountsUIWrapper"><span ref="container" /></div>;
  }
});

Login = React.createClass({

  login () {
    var username = React.findDOMNode(this.refs.username).value.trim();
    var password = React.findDOMNode(this.refs.password).value.trim();
    Meteor.loginWithPassword(username, password);
  },
  createUser () {
    var username = React.findDOMNode(this.refs.username).value.trim();
    var password = React.findDOMNode(this.refs.password).value.trim();
    Accounts.createUser({
      username : username,
      password : password
    }, function (err) {
      if (err) {
        alert("Failed to create new user");
      } else {
        Meteor.call('createUserData', username);
      }
    });
  },
  componentDidMount(){
      componentHandler.upgradeDom();

  },
  componentDidUpdate(){
      componentHandler.upgradeDom();
  },
  render () {
    return (
      <div className="login mdl-shadow--2dp">

          <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input className="mdl-textfield__input" type="text" ref="username"/>
            <label className="mdl-textfield__label">User Name</label>
          </div>
          <br/>
          <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input className="mdl-textfield__input" type="password" ref="password"/>
            <label className="mdl-textfield__label">Password</label>
          </div>
          <br/>
          <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"
                  onClick={this.login}>
            Login
          </button>
          <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--primary"
                  onClick={this.createUser}>
            Create User
          </button>
      </div>
    );
  },
});

if (Meteor.isServer) {
  Meteor.methods({
    //Create new userData
    createUserData (username) {
      var userDataObj = {
        username: username,
        pass: []
      }
      Problems.find({}).fetch().forEach(function (item) {
        //Create arrays for each existing problems. It will be used to save logs of each problem.
        userDataObj[item._id] = [];
      });
      userDataCollection.insert(userDataObj);
    }
  });
}
