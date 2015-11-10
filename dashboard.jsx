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
          { this.data.currentUser? '' : <Login /> }
        </div>
      </div>
    );  
  }
});
