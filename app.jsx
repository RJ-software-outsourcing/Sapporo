Problems = new Mongo.Collection("problems");
userDataCollection = new Mongo.Collection("userData");

// App component - represents the whole app
App = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData () {
        return {
            problems: Problems.find({}).fetch(),
            counter: timeSync.findOne({timeSync: true}),
            currentUser: Meteor.user(),
        };
    },
    renderProblems () {
        return this.data.problems.map (
            problem => {
                try {
                    if (this.data.counter.coding) {
                        return (
                            <a className="mdl-navigation__link" onClick={this.renderProblemPage.bind(this, problem)}>
                                {problem.title}
                            </a>
                        );
                    }
                } catch (e) {
                    return;
                }
            }
        );
    },
    renderProblemPage(problem){
        (React.render(<ProblemPage />, document.getElementById("main"))).update(problem);
    },
    componentDidMount () {
        this.renderDashboard();
    },
    componentDidUpdate(){
      componentHandler.upgradeDom();
    },
    renderDashboard () {
        React.render(<Dashboard />, document.getElementById("main"));
    },
    renderAdmin() {
        React.render(<Admin />, document.getElementById("main"));
    },
    renderAdminButton () {
        try {
            if (this.data.currentUser.username === 'admin') {
                return (
                    <a className="mdl-navigation__link" onClick={this.renderAdmin}>
                        Administrator
                    </a>
                );
            }
        } catch(e) {
            return;
        }
    },
    render() {
        return (
            <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header">
              <header className="mdl-layout__header mdl-color--blue-grey-700 mdl-color-text--blue-grey-50">
                <div className="mdl-layout__header-row">

                  <span className="mdl-layout-title">Sapporo Project</span>

                  <div className="mdl-layout-spacer"></div>

                  <nav className="mdl-layout--large-screen-only">
					<Timer />
                  </nav>
                </div>
              </header>
              <div className="mdl-layout__drawer">
				<nav className="mdl-navigation">
					<AccountsUIWrapper />
	                <a className="mdl-navigation__link" onClick={this.renderDashboard}>
	                    Dashboard
	                </a>
	                {this.renderAdminButton()}
				</nav>
                <span className="mdl-layout-title">Problems:</span>
                <nav className="mdl-navigation">
                    {this.data.currentUser? this.renderProblems():''}
                </nav>
              </div>
              <main className="mdl-layout__content">
                <div className="page-content" id="main"></div>
              </main>
            </div>
        );
    }
});
