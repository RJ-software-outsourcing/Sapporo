Admin = React.createClass({

  mixins: [ReactMeteorData],
  getMeteorData () {
    return {
      currentUser: Meteor.user(),
    }
  },

  render() {
    return (
      <div>
        <div>
          <h1>Administrator Page</h1>
        </div>
      </div>
    );
  }
});
