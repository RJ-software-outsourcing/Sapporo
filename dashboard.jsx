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
                userData: userDataCollection.findOne({username: Meteor.user()})
            }
    },
    totalScore () {
        
        return (
            <div>

            </div>
        );
    },
    render() {
        return (
            <div style={{border:'1px solid red'}}>
                <span>{this.totalScore()}</span>
            </div>
        );
    }
});
