Admin = React.createClass({

  mixins: [ReactMeteorData],
  getMeteorData () {
    return {
      currentUser: Meteor.user(),
      problems: Problems.find({}).fetch(),
      timeControl: timeSync.findOne({timeSync: true})
    }
  },

  problemSetting () {
    return this.data.problems.map (
        problem => {
          return (
            <div>
              <a>{problem.title}</a>
            </div>
          );
        }
    );
  },

  insertProblem () {
    var problemObj = {};
    problemObj.title = React.findDOMNode(this.refs.problemTitle).value.trim();
    problemObj.content = React.findDOMNode(this.refs.problemContent).value.trim();
    Meteor.call('insertProblem', problemObj);
  },

  renderFakeInsert () {
    return (
      <div>
        <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
          <input className="mdl-textfield__input" type="text" ref="problemTitle"/>
          <label className="mdl-textfield__label">Title</label>
        </div>
        <br/>
        <div className="mdl-textfield mdl-js-textfield">
          <textarea className="mdl-textfield__input" type="text" rows= "10" ref="problemContent" ></textarea>
          <label className="mdl-textfield__label">Descriptions</label>
        </div>
        <button onClick={this.insertProblem}>Insert fake problem</button>
      </div>
    );
  },

  renderSiteConfig () {
    return (
      <div>
        <span>New Start Time:</span><br/>
        <div className="mdl-textfield mdl-js-textfield">
          <input className="mdl-textfield__input" type="number" min="0" max="23" ref="startHour"/>
          <label className="mdl-textfield__label">0 ~ 23</label>
          <span className="mdl-textfield__error">Only number between 0 to 23 is allowed</span>
        </div>
        <div className="mdl-textfield mdl-js-textfield">
          <input className="mdl-textfield__input" type="number" min="0" max="59" ref="startMinute"/>
          <label className="mdl-textfield__label">0 ~ 59</label>
          <span className="mdl-textfield__error">Only number between 0 to 59 is allowed</span>
        </div>
        <br/>
        <span>New End Time:</span><br/>
        <div className="mdl-textfield mdl-js-textfield">
          <input className="mdl-textfield__input" type="number" min="0" max="23" ref="endHour"/>
          <label className="mdl-textfield__label">0 ~ 23</label>
          <span className="mdl-textfield__error">Only number between 0 to 23 is allowed</span>
        </div>
        <div className="mdl-textfield mdl-js-textfield">
          <input className="mdl-textfield__input" type="number" min="0" max="59" ref="endMinute"/>
          <label className="mdl-textfield__label">0 ~ 59</label>
          <span className="mdl-textfield__error">Only number between 0 to 59 is allowed</span>
        </div><br/>
        <span>
          Current Schedule: {this.data.timeControl.startHour}:{this.data.timeControl.endMinute}
           to {this.data.timeControl.endHour}:{this.data.timeControl.endMinute}
        </span><br/>
        <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--primary"
                onClick={this.applySiteConfig}>
          Apply
        </button>
      </div>

    );
  },

  applySiteConfig () {
    var config = {
      time: {}
    };
    config.time.startHour   = parseInt(React.findDOMNode(this.refs.startHour).value.trim());
    config.time.startMinute = parseInt(React.findDOMNode(this.refs.startMinute).value.trim());
    config.time.endHour   = parseInt(React.findDOMNode(this.refs.endHour).value.trim());
    config.time.endMinute = parseInt(React.findDOMNode(this.refs.endMinute).value.trim());


    if (this.verifySiteConfig(config)) {
      this.setSiteConfig(config);
    } else {
      console.log("config verification failed");
    }

  },
  verifySiteConfig (config) {
    for (var prop in config.time) {
      if (isNaN(config.time[prop])) {
        return false;
      } else {
        if (config.time[prop] < 0) {
          return false;
        }
      }
    }
    if (config.time.startHour > 23 || config.time.endHour > 23) {
      return false
    }
    if (config.time.startMinute > 59 || config.time.endMinute > 59) {
      return false
    }
    return true;
  },

  setSiteConfig (config) {
    timeSync.update({
      _id: this.data.timeControl._id
    }, {
      $set: {
        startHour: config.time.startHour,
        startMinute: config.time.startMinute,
        endHour: config.time.endHour,
        endMinute: config.time.endMinute
      }
    });
  },

  componentDidMount() {
      componentHandler.upgradeDom();

  },

  componentDidUpdate() {
      componentHandler.upgradeDom();
  },

  render() {
    return (
      <div className="mdl-tabs mdl-js-tabs mdl-js-ripple-effect" id="adminTab">
        <div className="mdl-tabs__tab-bar">
            <a href="#siteConfig"     className="mdl-tabs__tab is-active">Site Config</a>
            <a href="#userAccounts"   className="mdl-tabs__tab">User Account</a>
            <a href="#problemsConfig" className="mdl-tabs__tab">Problems</a>
        </div>

        <div className="mdl-tabs__panel is-active" id="siteConfig">
          {this.renderSiteConfig()}
        </div>
        <div className="mdl-tabs__panel" id="userAccounts">
          <p>User Account</p>
        </div>
        <div className="mdl-tabs__panel" id="problemsConfig">
          {this.problemSetting()}
          {this.renderFakeInsert()}
        </div>
      </div>
    );
  }
});

if (Meteor.isServer) {
  //insert new problem and attach new problem id under all userData
  Meteor.methods({
    insertProblem (problemObj) {
      Problems.insert(problemObj, function (err, id) {
        if (err) {
          console.log(err);
        }
        console.log(id);
        var tmp = {};
        tmp[id] = [];
        userDataCollection.update({}, {
          $set: tmp
        }, {
          multi:true
        });
      });
    }
  });

}
