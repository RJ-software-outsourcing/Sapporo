Admin = React.createClass({

  mixins: [ReactMeteorData],
  getMeteorData () {
    return {
      currentUser: Meteor.user(),
    }
  },
  componentDidMount() {
    componentHandler.upgradeElement(adminTab,"MaterialTabs");
  },
  render() {
    return (


<div className="mdl-tabs mdl-js-tabs mdl-js-ripple-effect" id="adminTab">
  <div className="mdl-tabs__tab-bar">
      <a href="#starks-panel" className="mdl-tabs__tab is-active">Site Config</a>
      <a href="#lannisters-panel" className="mdl-tabs__tab">User Account</a>
      <a href="#targaryens-panel" className="mdl-tabs__tab">Problems</a>
  </div>

  <div className="mdl-tabs__panel is-active" id="starks-panel">
    <p>Site Config</p>
  </div>
  <div className="mdl-tabs__panel" id="lannisters-panel">
    <p>User Account</p>
  </div>
  <div className="mdl-tabs__panel" id="targaryens-panel">
    <p>Problem</p>
  </div>
</div>



    );
  }
});
