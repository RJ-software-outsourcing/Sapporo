Dashboard = React.createClass({

    mixins: [ReactMeteorData],
        getMeteorData () {
            return {
                currentUser: Meteor.user(),
            }
    },

    render() {
        return (
            <div className="dashboard">
                <div className="dashboardMain">
                    { this.data.currentUser? <DashboardInstance /> : <Login /> }
                </div>
            </div>
        );
    }
});

DashboardInstance = React.createClass({
        mixins: [ReactMeteorData],
        getMeteorData () {
            return {
                userData: userDataCollection.findOne({username: Meteor.user().username}),
                problems: Problems.find({}).fetch()
            }
    },
    getInitialState () {
        return {
        };
    },
    componentDidMount () {
        this.setState({problemPassChart: document.getElementById("problemPassChart")});
    },
    componentDidUpdate() {
      componentHandler.upgradeDom();
    },
    totalScore () {
        var score = 0;
        if (!this.data.userData || !this.data.userData.hasOwnProperty('pass')) {
            return '';
        }
        this.data.userData.pass.forEach(function (item) {
            var problem = Problems.findOne({_id:item});
            if (problem) {
                var tmp = Number(problem.score);
                if (!isNaN(tmp)) {
                    score += tmp;
                }
            }
        });
        return (
            <div className="mdl-cell mdl-cell--2-col">
                <span>Total Score</span>
                <h3>{score}</h3>
            </div>
        );
    },
    submitCount () {
        if (!this.data.userData) return;
        var count = 0;
        for (var property in this.data.userData) {
            if (this.data.userData.hasOwnProperty(property)) {
                if (property === 'username' || property === 'pass' || property === '_id') {
                    continue;
                } else {
                    if (this.data.userData[property].constructor === Array) {
                        count += this.data.userData[property].length;
                    }
                }
            }
        }
        return (
            <div className="mdl-cell mdl-cell--2-col">
                <span>Total Submissions</span>
                <h3>{count}</h3>
            </div>
        );
    },
    renderProblemPassChart () {
        if (!this.state.problemPassChart
            || !this.data.userData
            || !this.data.userData.hasOwnProperty('pass')) {
            return '';
        }
        var count = 0;
        this.data.userData.pass.forEach(function (item) {
            var problem = Problems.findOne({_id:item});
            if (problem) {
                count += 1;
            }
        });
        var left = this.data.problems.length - count;
        var data = [{
            value: left,
            color: "#CCC",
            highlight: "#666",
            label: "Not Yet"
        },{
            value: count,
            color:"#46BFBD",
            highlight: "#5AD3D1",
            label: "Pass"
        }];
        var ctx = this.state.problemPassChart.getContext("2d");
        window.problemPassChart = new Chart(ctx).Doughnut(data);
    },
    render() {
        return (
            <div>
                <div className="dashboardGrid mdl-grid">
                    {this.totalScore()}
                    {this.submitCount()}
                    <div className="mdl-cell mdl-cell--4-col">
                    </div>
                </div>
                <div className="dashboardGrid mdl-grid">
                    <div className="mdl-cell mdl-cell--4-col">
                        <span>Problem Pass</span><br/>
                        <canvas id="problemPassChart" width="150" height="150"></canvas>
                        {this.renderProblemPassChart()}
                    </div>
                </div>
            </div>
        );
    }
});
