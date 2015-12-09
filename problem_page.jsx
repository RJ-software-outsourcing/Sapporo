
//Problem page
ProblemPage = React.createClass({
  getInitialState () {
    return {
      problem: {},
      editor: {},
      language: ''
    }
  },
  componentDidMount () {
      this.state.editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
        lineNumbers: true,
      });
      this.state.editor.setOption("theme", "blackboard");
  },
  update (data) {
    this.setState({
      problem: data
    }, function () {
      localStorage.setItem('currentProblem', this.state.problem._id);
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
  languageChange (event) {
      this.setState({ language: event.target.value });
  },
  test() {
    var code = this.state.editor.getValue();
    Meteor.call('dockerRunSample', code, this.state.problem._id, function (err, result) {
      console.log(result);
      alert("Returned Status Code: " + result);
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
        <div className="problemPageButtons">
            <span>Language:</span>
            <select name="language" value={this.state.language} onChange={this.languageChange}>
                <option value="python">Python</option>
                <option value="javascript">Javascript (Node.JS)</option>
                <option value="c">C</option>
            </select>
            <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">
                Submit
            </button>
            <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--primary"
                    onClick={this.test}>
                test
            </button>
        </div>
        <div className="editorDiv">
            <textarea id="editor" name="editor"></textarea>
        </div>
        <span>{this.state.problem._id}</span>
      </div>
    );
  },
});
