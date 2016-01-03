Analyse = React.createClass({
    getInitialState () {
        return {
        };
    },
    mixins: [ReactMeteorData],
        getMeteorData () {
            return {
                currentUser: Meteor.user(),
                problems: Problems.find({}).fetch(),
                allUser: userDataCollection.find({}).fetch()
            };
        },
    componentDidMount() {
        this.drawProblemAnalyseChart();
    },
    componentDidUpdate() {
        componentHandler.upgradeDom();
        //this.drawProblemAnalyseChart();
    },
    userTotalScore (user) {
        if (!user.pass) return;
        var score = 0;
        user.pass.forEach(function (item) {
            var problem = Problems.findOne({_id:item});
            if (problem) {
                var tmp = Number(problem.score);
                if (!isNaN(tmp)) {
                    score += tmp;
                }
            }
        });
        return score;
    },
    renderRank () {
        var rankArray = this.data.allUser.map(
            (user, key) => {
                return ({
                    username: user.username,
                    score: this.userTotalScore(user)
                });
            }
        ).sort(function (a, b) {
            return (b.score) - (a.score);
        });
        return rankArray.map(
            (user, key) => {
                return (
                    <tr>
                      <td className="mdl-data-table__cell">{key+1}</td>
                      <td className="mdl-data-table__cell--non-numeric">{user.username}</td>
                      <td className="mdl-data-table__cell" style={{color: 'green'}}>{user.score}</td>
                    </tr>
                );
            }
        );
    },
    submitCount(problemId){
        var count = 0;
        this.data.allUser.forEach(function(user) {
            if (user[problemId] && user[problemId].length > 0) {
                count += 1;
            }
        });
        return count;
    },
    renderProblemAnalyse() {
        return this.data.problems.map(
            (problem, key) => {
                var submitCountChartId = 'submitCountId' + problem._id;
                return (
                    <div>
                        <h3 style={{color:'#546E7A'}}>{problem.title}</h3>
                        <div className="mdl-grid problemAnalyseGrid">
                            <div className="mdl-cell mdl-cell--2-col">
                                <span>Submitted Users</span><br/>
                                <canvas id={submitCountChartId} width="150" height="150"></canvas>
                            </div>
                            <div className="mdl-cell mdl-cell--2-col">
                                <canvas id="submitCorrectRate" width="150" height="150"></canvas>
                            </div>
                        </div>
                    </div>
                );
            }
        );
    },
    drawProblemAnalyseChart () {
        var submitCount = 0;
        if (!this.data.allUser || this.data.allUser.length === 0) return;
        this.data.problems.map(
            (problem, key) => {
                submitCount = this.submitCount(problem._id);
                var submitCountChartId = 'submitCountId'+problem._id;
                var submitCountChart = document.getElementById(submitCountChartId).getContext("2d");
                var data = [{
                    value: this.data.allUser.length - submitCount,
                    color: "#CCC",
                    highlight: "#666",
                    label: "Not Yet"
                },{
                    value: submitCount,
                    color:"#46BFBD",
                    highlight: "#5AD3D1",
                    label: "Submitted"
                }];
                window[submitCountChartId] = new Chart(submitCountChart).Pie(data);
            }
        );
    },
    render() {
        return (
            <div className="dashboard">
                <div className="mdl-tabs mdl-js-tabs mdl-js-ripple-effect dashboardMain" id="adminTab">
                    <div className="mdl-tabs__tab-bar">
                        <a href="#problemAnalyse"   className="mdl-tabs__tab is-active"><b>Problem Analyse</b></a>
                        <a href="#userAnalyse" className="mdl-tabs__tab"><b>User Analyse</b></a>
                        <a href="#rank"     className="mdl-tabs__tab"><b>rank</b></a>
                    </div>
                    <div className="mdl-tabs__panel is-active" id="problemAnalyse">
                        {this.renderProblemAnalyse()}
                    </div>
                    <div className="mdl-tabs__panel" id="userAnalyse">
                        user analyse
                    </div>
                    <div className="mdl-tabs__panel" id="rank">
                        <table className="mdl-data-table mdl-js-data-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th className="mdl-data-table__cell--non-numeric">User</th>
                                    <th>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.renderRank()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
});
