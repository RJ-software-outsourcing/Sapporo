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
            <tr onClick={this.clickProblem.bind(this, problem)}>
              <td>{problem.score}</td>
              <td className="mdl-data-table__cell--non-numeric">{problem.title}</td>
            </tr>
          );
        }
    );
  },
  clickProblem (problem) {
    (React.render(<ProblemConfig />, document.getElementById("modalArea"))).update(problem);
  },
  insertProblem () {
    var problemObj = {};
    problemObj.title   = React.findDOMNode(this.refs.problemTitle).value.trim();
    //problemObj.content = React.findDOMNode(this.refs.problemContent).value.trim();
    problemObj.score   = parseInt(React.findDOMNode(this.refs.problemScore).value.trim());
    Meteor.call('insertProblem', problemObj);
  },
  renderProblemConfig () {
    return (
      <table className="mdl-data-table mdl-js-data-table problemTableAndInsert">
        <thead>
          <tr>
            <th>Score</th>
            <th className="mdl-data-table__cell--non-numeric">Title</th>
          </tr>
        </thead>
        <tbody>
          {this.problemSetting()}
        </tbody>
      </table>
    );
  },
  renderProblemInsert () {
    return (
        <div className="mdl-card problemTableAndInsert" style={{display:'inline-block'}}>
          <div className="mdl-textfield mdl-js-textfield" style={{width: '10%'}}>
            <input className="mdl-textfield__input" type="number" min="0" max="100" ref="problemScore"/>
            <label className="mdl-textfield__label">Score</label>
            <span className="mdl-textfield__error">maximum: 100</span>
          </div>
          <div className="mdl-textfield mdl-js-textfield" style={{width: '50%', margin: '0 5% 0 2%'}}>
            <input className="mdl-textfield__input" type="text" ref="problemTitle"/>
            <label className="mdl-textfield__label">Title</label>
          </div>
          <button onClick={this.insertProblem}
            className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">
            Insert New Problem
          </button>
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
      <div className="dashboard">
        <div className="mdl-tabs mdl-js-tabs mdl-js-ripple-effect dashboardMain" id="adminTab">
          <div className="mdl-tabs__tab-bar">
              <a href="#siteConfig"     className="mdl-tabs__tab is-active"><b>Site Config</b></a>
              <a href="#userAccounts"   className="mdl-tabs__tab"><b>User Account</b></a>
              <a href="#problemsConfig" className="mdl-tabs__tab"><b>Problems</b></a>
          </div>

          <div className="mdl-tabs__panel is-active" id="siteConfig">
            {this.renderSiteConfig()}
          </div>
          <div className="mdl-tabs__panel" id="userAccounts">
            <p>User Account</p>
          </div>
          <div className="mdl-tabs__panel" id="problemsConfig">
            {this.renderProblemInsert()}
            {this.renderProblemConfig()}
          </div>
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

ProblemConfig = React.createClass({
  getInitialState () {
    return {
      problem: {},
    }
  },
  update (data) {
    this.setState({
      problem: data
    }, function () {

    });
  },
  cancel () {
    React.unmountComponentAtNode(document.getElementById('modalArea'));
  },
  render() {
    return (
      <div className="problemConfigBG">
        <div className="problemConfig">
          {this.state.problem.title}
          <button onClick={this.cancel}>Cancel</button>
        </div>
      </div>
    );
  }
});