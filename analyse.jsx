Analyse = React.createClass({

    mixins: [ReactMeteorData],
        getMeteorData () {
            return {
                currentUser: Meteor.user(),
                problems: Problems.find({}).fetch(),
                allUser: userDataCollection.find({}).fetch()
            };
        },
    componentDidMount() {
        componentHandler.upgradeDom();

    },
    componentDidUpdate() {
        componentHandler.upgradeDom();
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
                      <td>{key+1}</td>
                      <td className="mdl-data-table__cell--non-numeric">{user.username}</td>
                      <td style={{color: 'green'}}>{user.score}</td>
                    </tr>
                );
            }
        );
    },
    render() {
        return (
            <div className="dashboard">
                <div className="mdl-tabs mdl-js-tabs mdl-js-ripple-effect dashboardMain" id="adminTab">
                    <div className="mdl-tabs__tab-bar">
                        <a href="#rank"     className="mdl-tabs__tab is-active"><b>rank</b></a>
                        <a href="#problemAnalyse"   className="mdl-tabs__tab"><b>Problem Analyse</b></a>
                        <a href="#userAnalyse" className="mdl-tabs__tab"><b>User Analyse</b></a>
                    </div>

                    <div className="mdl-tabs__panel is-active" id="rank">
                        <table className="mdl-data-table mdl-js-data-table problemTableAndInsert">
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
                    <div className="mdl-tabs__panel" id="problemAnalyse">
                        problem analyse
                    </div>
                    <div className="mdl-tabs__panel" id="userAnalyse">
                        user analyse
                    </div>
                </div>
            </div>
        );
    }
});
