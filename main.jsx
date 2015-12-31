if (Meteor.isClient) {

    var checkConnection = function () {
      if (!Meteor.status().connected) {
          if (confirm('Lost server connection. Click Yes to reload.')) {
              location.reload();
          } else {
              location.reload();
          }
      }
      setTimeout(function () {
          checkConnection();
      }, 5000);
    }

    Meteor.startup(function () {
    // Use Meteor.startup to render the component after the page is ready
    Accounts.ui.config({
    	passwordSignupFields: "USERNAME_ONLY"
    	});
    React.render(<App />, document.getElementById("app"));
        //checkConnection(); //Enable connection check for production
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
    // code to run on server at startup
    });
}
