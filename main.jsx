if (Meteor.isClient) {
  // This code is executed on the client only

  Meteor.startup(function () {
    // Use Meteor.startup to render the component after the page is ready
    Accounts.ui.config({
    	passwordSignupFields: "USERNAME_ONLY"
  	});
    React.render(<App />, document.getElementById("app"));
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
