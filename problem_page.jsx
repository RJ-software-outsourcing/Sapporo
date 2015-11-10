
//Problem page
ProblemPage = React.createClass({
  getInitialState () {
    return {
      problem: {},
      editor: {}
    }
  },
  componentDidMount () {
      this.state.editor = CodeMirror.fromTextArea(document.getElementById("demotext"), {
        lineNumbers: true,
      });
      this.state.editor.setOption("theme", "blackboard");
  },
  update (data) {
    this.setState({
      problem: data
    }, function () {
      localStorage.setItem('currentProblem', this.state.problem.title);
      this.state.editor.on("change", function (cm, change) {
        localStorage.setItem(localStorage.getItem('currentProblem'), cm.getValue());
      });
      var savedText = localStorage.getItem(localStorage.getItem('currentProblem'));
      if (savedText) {
        this.state.editor.setValue(savedText);
      } else {
        this.state.editor.setValue('');
      }
    });
    //this.state.editor.setValue(Session.get(this.state.problem.title));
  },
  test() {
    var code = this.state.editor.getValue();
    Meteor.call('test', code, this.state.problem._id, function (err, result) {
      console.log(result);
    });
  },
  render() {
    return (
      <div>
        <div className="problemTitle problemTitleSmall mdl-layout--small-screen-only mdl-shadow--2dp">
          <h4>{this.state.problem.title}</h4>
        </div>
        <div className="problemTitle mdl-layout--large-screen-only mdl-shadow--2dp">
          <h4>{this.state.problem.title}</h4>
        </div>
        <textarea className="problemDescription" readOnly value={this.state.problem.content}></textarea>
        <textarea id="demotext" name="demotext"></textarea>
        <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect"
                onClick={this.test}>
          test
        </button>
      </div>
    );
  },
});

if (Meteor.isServer) {

  Meteor.methods({
    test (code, problemId) {
      var userData = userDataCollection.findOne({username: Meteor.user().username});
      console.log(problemId);
      console.log(userData);
    }
  });

  var fakeValidation = function () {
    var threshold = 0.6;
    var randomNumber = Math.random();
    if (randomNumber <= 0.6) {
      return true;
    } else {
      return false;
    }
  };

}


