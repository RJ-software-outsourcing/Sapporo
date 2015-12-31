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
              <td style={{color: 'green'}}>{problem.score}</td>
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
    if (typeof(problemObj.score) !== 'number') {
      alert('please enter a valid score');
      return;
    }
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
          <div className="mdl-textfield mdl-textfield--floating-label mdl-js-textfield" style={{width: '50%', margin: '0 5% 0 2%'}}>
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

  Meteor.methods({
    //insert new problem and attach new problem id under all userData
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
          multi: true
        });
      });
    },
    //Delete a problem and remove this id under all userData as well
    deleteProblem (id) {
      Problems.remove({
        _id: id
      }, function (err) {
        if (err) {
          console.log(err);
          return;
        } else {
          var tmp = {};
          tmp[id] = "";
          userDataCollection.update({}, {
            $unset: tmp
          }, {
            multi: true
          });
          }
      });
    },
    updateProblem (problem) {
      Problems.update({
          _id: problem._id
      }, {
          $set: problem
      });
    }
  });
}

ProblemConfig = React.createClass({
  getInitialState () {
    return {
    }
  },
  update (data) {
    //console.log(typeof(data.score));
    this.setState({
      title: data.title,
      score: data.score,
      id: data._id,
      content: data.content,
      input: data.input,
      output: data.output,
      testInput: data.testInput,
      testOutput: data.testOutput
    }, function () {

    });
  },
  handleTitle (event) {
    this.setState({title: event.target.value});
  },
  handleScore (event) {
    this.setState({score:event.target.value});
  },
  handleContent (event) {
    this.setState({content:event.target.value});
  },
  handleInput (event) {
      this.setState({input:event.target.value});
  },
  handleOutput (event) {
      this.setState({output:event.target.value});
  },
  handleTestInput (event) {
      this.setState({testInput:event.target.value});
  },
  handleTestOutput (event) {
      this.setState({testOutput:event.target.value});
  },
  closeDialog () {
    React.unmountComponentAtNode(document.getElementById('modalArea'));
  },
  updateProblem () {
      var problem = {
          title: this.state.title,
          score: this.state.score,
          _id: this.state.id,
          content: this.state.content,
          input: this.state.input,
          output: this.state.output,
          testInput: this.state.testInput,
          testOutput: this.state.testOutput
      }
      Meteor.call('updateProblem', problem);
      this.closeDialog();
  },
  deleteProblem (id) {
    if (confirm("Are you sure?")) {
      Meteor.call('deleteProblem', id);
      this.closeDialog();
    }
    return;
  },
  componentDidUpdate() {
      componentHandler.upgradeDom();
  },
  render() {
    return (
      <div className="modalBG">
        <div className="problemConfig">
          <div className="mdl-textfield mdl-textfield--floating-label mdl-js-textfield" style={{width: '10%'}}>
            <input className="mdl-textfield__input" type="number" min="0" max="100" value={this.state.score} onChange={this.handleScore}/>
            <label className="mdl-textfield__label">Score</label>
            <span className="mdl-textfield__error">maximum: 100</span>
          </div><br/>
          <div className="mdl-textfield mdl-textfield--floating-label mdl-js-textfield" style={{width: '100%'}}>
            <input className="mdl-textfield__input" type="text" value={this.state.title} onChange={this.handleTitle}/>
            <label className="mdl-textfield__label">Title</label>
          </div>
          <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style={{width: '100%'}}>
            <textarea className="mdl-textfield__input" type="text" rows= "12" value={this.state.content} onChange={this.handleContent}></textarea>
            <label className="mdl-textfield__label">Problem Description</label>
          </div>
          <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style={{width: '50%'}}>
            <textarea className="mdl-textfield__input" type="text" rows= "6" value={this.state.input} onChange={this.handleInput}></textarea>
            <label className="mdl-textfield__label">Input Description</label>
          </div>
          <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style={{width: '50%'}}>
            <textarea className="mdl-textfield__input" type="text" rows= "6" value={this.state.output} onChange={this.handleOutput}></textarea>
            <label className="mdl-textfield__label">Output Description</label>
          </div>
          <div className="mdl-textfield mdl-textfield--floating-label mdl-js-textfield" style={{width: '50%'}}>
            <input className="mdl-textfield__input" type="text" value={this.state.testInput} onChange={this.handleTestInput}/>
            <label className="mdl-textfield__label">Test Input</label>
          </div>
          <div className="mdl-textfield mdl-textfield--floating-label mdl-js-textfield" style={{width: '100%'}}>
            <textarea className="mdl-textfield__input" type="text" rows= "6" value={this.state.testOutput} onChange={this.handleTestOutput}></textarea>
            <label className="mdl-textfield__label">Test Output</label>
          </div>
          <button onClick={this.closeDialog}
            className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--primary">
            Cancel
          </button>
          <button onClick={this.updateProblem}
            className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--primary">
            Update
          </button>
          <button onClick={this.deleteProblem.bind(this, this.state.id)}
            className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">
            Delete
          </button>
        </div>
      </div>
    );
  }
});
