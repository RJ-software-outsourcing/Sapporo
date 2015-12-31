/*
TestConsole = React.createClass({
    getInitialState() {
        return {
            mine: '',
            correct: '',
            isSuccess: false
        };
    },
    update (result) {
        this.setState({
            mine: result.mine,
            correct: result.correct,
            isSuccess: result.isSuccess
        })
    },
    render() {
        return (
            <div className="mdl-shadow--2dp testCard">
                {
                    this.state.isSuccess?
                    <span className="testSuccess">Success</span>:<span className="testFailed">Failed</span>
                }
                <div className="testConsole">
                    <textarea value={"Your result:\n\n" + this.state.mine}></textarea>
                    <textarea value={"Correct Answer: \n\n" + this.state.correct}></textarea>
                </div>
            </div>
        );
    }
});
*/

//Problem page
ProblemPage = React.createClass({
  getInitialState () {
    return {
      problem: {},
      editor: {},
      language: 'python',
    };
  },
  componentDidMount () {
      this.state.editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
        lineNumbers: true,
        mode: this.state.language
      });
      this.state.editor.setOption("theme", "blackboard");
      this.state.editor.setSize('100%', 600);
  },
  update (data) {
    this.setState({
      problem: data
    }, function () {
        React.unmountComponentAtNode(document.getElementById('testResultRender'));
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
  },
  languageChange (event) {
      this.setState({ language: event.target.value });
      this.state.editor.setOption("mode", event.target.value );
  },
  test() {
    var code = this.state.editor.getValue();
    var lang = this.state.language;
    var output = {
        mine: 'Not available',
        correct: 'Not availble',
        isSuccess: false
    }
    Meteor.call('dockerRunSample', code, this.state.problem._id, lang, function (err, result) {
        output.mine = result;
        (React.render(<TestConsole />, document.getElementById("modalArea"))).update(output);
    });
  },
  render() {
    return (
      <div id='problemPanel'>
        <div id='leftPanel'>
            <div className="problemTitle">
                <span>{this.state.problem.title}</span>
            </div>
        <textarea className="problemDescription" readOnly value={this.state.problem.content}></textarea>
        </div>
        <div id='rightPanel'>
            <div className="problemPageButtons">
                <span>Language:</span>
                <select name="language" value={this.state.language} onChange={this.languageChange}>
                    <option value="python">Python 3</option>
                    <option value="javascript">Javascript (Node.js)</option>
                    <option value="text/x-csrc">C</option>
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
      </div>
    );
  },
});


TestConsole = React.createClass({
    getInitialState() {
        return {
            mine: '',
            correct: '',
            isSuccess: false
        };
    },
    update (result) {
        this.setState({
            mine: result.mine,
            correct: result.correct,
            isSuccess: result.isSuccess
        })
    },
    closeDialog () {
    React.unmountComponentAtNode(document.getElementById('modalArea'));
    },
    componentDidUpdate() {
      componentHandler.upgradeDom();
    },
    render() {
    return (
        <div className="modalBG">
            <div className="testConsole">
                {
                    this.state.isSuccess?
                    <h3 className="testSuccess">Success</h3>:<h3 className="testFailed">Failed</h3>
                }
                <div className="testResultTitle">
                    <div style={{float:'left'}}>Your result:</div>
                    <div style={{float:'right'}}>Expected answer:</div>
                </div>
                <textarea className="testMyAnswer" value={this.state.mine}></textarea>
                <textarea className="testCorrectAnswer" value={this.state.correct}></textarea>
                <button onClick={this.closeDialog} style={{marginTop:'2vh'}} 
                    className="mdl-button mdl-js-button mdl-js-ripple-effect">
                    close
                </button>
            </div>
        </div>
    );
    }
});
