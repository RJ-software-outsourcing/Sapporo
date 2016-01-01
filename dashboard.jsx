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
            <div className="mdl-cell mdl-cell--4-col">
                <span>Total Score</span>
                <h3>{score}</h3>
            </div>
        );
    },
    problemPass () {
        var count = 0;
        if (!this.data.userData || !this.data.userData.hasOwnProperty('pass')) {
            return '';
        }
        this.data.userData.pass.forEach(function (item) {
            var problem = Problems.findOne({_id:item});
            if (problem) {
                count += 1;
            }
        });
        return (
            <div className="mdl-cell mdl-cell--4-col">
                <span>Problem Pass</span>
                <h3>{count} / {this.data.problems.length}</h3>
            </div>
        );
    },
    render() {
        return (
            <div>
                <div className="dashboardGrid mdl-grid" style={{border:'1px solid red'}}>
                    {this.totalScore()}
                    {this.problemPass()}
                    <div className="mdl-cell mdl-cell--4-col">
                        Total Score:
                    </div>
                </div>
            </div>
        );
    }
});
