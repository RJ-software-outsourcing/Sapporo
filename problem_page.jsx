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
      this.state.editor.setSize('100%', 560);
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
  },
  languageChange (event) {
      this.setState({ language: event.target.value });
      this.state.editor.setOption("mode", event.target.value );
  },
  test() {
    var code = this.state.editor.getValue();
    var lang = this.state.language;
    React.render(<Loading />, document.getElementById("modalArea"));
    Meteor.call('testCode', code, this.state.problem._id, lang, function (err, result) {
        (React.render(<TestConsole />, document.getElementById("modalArea"))).update(result);
    });
  },
  submit(){
      var code = this.state.editor.getValue();
      var lang = this.state.language;
      React.render(<Loading />, document.getElementById("modalArea"));
      Meteor.call('submitCode', code, this.state.problem._id, lang, function (err, result) {
          if (result) {
              alert('Pass');
          } else {
              alert('Failed');
          }
          React.unmountComponentAtNode(document.getElementById('modalArea'));
      });
  },
  render() {
    return (
      <div id='problemPanel'>
        <div id='leftPanel'>
            <div className="problemTitle">
                <span>{this.state.problem.title}</span>
            </div>
            <div >
                <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style={{width: '100%'}}>
                  <textarea className="mdl-textfield__input" type="text" rows= "18" readonly value={this.state.problem.content}></textarea>
                  <label className="mdl-textfield__label">Summary</label>
                </div>
                <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style={{width: '49%'}}>
                  <textarea className="mdl-textfield__input" type="text" rows= "10" readonly value={this.state.problem.input}></textarea>
                  <label className="mdl-textfield__label">Input example</label>
                </div>
                <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style={{width: '49%'}}>
                  <textarea className="mdl-textfield__input" type="text" rows= "10" readonly value={this.state.problem.output}></textarea>
                  <label className="mdl-textfield__label">Output example</label>
                </div>
            </div>
        </div>
        <div id='rightPanel'>
            <div className="problemPageButtons">
                <span style={{fontWeight:'bold',color:'#546E7A'}}>Language:&nbsp;</span>
                <select name="language" value={this.state.language} onChange={this.languageChange}>
                    <option value="python">Python 3</option>
                    <option value="javascript">Javascript (Node.js)</option>
                    <option value="text/x-csrc">C</option>
                </select>
                <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"
                        onClick={this.submit}>
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
        };
    },
    update (result) {
        this.setState({
            err: result.err,
            expectedOutput: result.expectedOutput,
            input: result.input,
            output: result.output? result.output:result.err,
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
                <div className="mdl-textfield mdl-textfield--floating-label mdl-js-textfield" style={{width: '80%'}}>
                  <input className="mdl-textfield__input" type="text" value={this.state.input}/>
                  <label className="mdl-textfield__label">Test Input</label>
                </div>
                <div className="testResultTitle">
                    <div style={{float:'left'}}>Your result:</div>
                    <div style={{float:'right'}}>Expected answer:</div>
                </div>
                <textarea className="testMyAnswer" value={this.state.output}></textarea>
                <textarea className="testCorrectAnswer" value={this.state.expectedOutput}></textarea>
                <button onClick={this.closeDialog} style={{margin:'20px'}}
                    className="mdl-button mdl-js-button mdl-js-ripple-effect">
                    close
                </button>
            </div>
        </div>
    );
    }
});


Loading = React.createClass({
    componentDidUpdate() {
      componentHandler.upgradeDom();
    },
    render() {
    return (
        <div className="modalBG">
            <div className="mdl-spinner mdl-js-spinner is-active"
                style={{width:'100px', height: '100px', left: '50%', marginLeft:'-50px', top: '50vh', marginTop:'-50px'}}
            ></div>
        </div>
    );
    }
});
