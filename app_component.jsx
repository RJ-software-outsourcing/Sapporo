Problems = new Mongo.Collection("problems");
userDataCollection = new Mongo.Collection("userData");

// App component - represents the whole app
App = React.createClass({
	mixins: [ReactMeteorData],
	getMeteorData () {
		return {
			problems: Problems.find({}).fetch(),
			counter: timeSync.find({timeSync: true}).fetch(),
			currentUser: Meteor.user(),
		}
	},
	renderProblems () {
		return this.data.problems.map(
			problem => {
				if (this.data.counter[0].coding) {
					return (
						<a className="mdl-navigation__link" onClick={this.renderProblemPage.bind(this, problem)}>
							{problem.title}
						</a>
					);
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
			<div className="mdl-layout mdl-js-layout mdl-layout--fixed-drawer">
				<div className="mdl-layout__drawer mdl-color--blue-grey-900 mdl-color-text--blue-grey-50">
					<Logo />
					<AccountsUIWrapper />

					<nav className="mdl-navigation">
						<a className="mdl-navigation__link" onClick={this.renderDashboard}>
							Dashboard
						</a>
						{this.renderAdminButton()}
					</nav>

					<span className="mdl-layout-title">Problems</span>
					<nav className="mdl-navigation">
						{this.data.currentUser? this.renderProblems():''}
					</nav>
				</div>
				<main className="mdl-layout__content">
					<div className="page-content" id="main">
					</div>
					<Timer />
				</main>
			</div>
		);
	}
});
