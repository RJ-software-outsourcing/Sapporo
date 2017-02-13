console.log(process.argv)

var user = process.argv[3]
var url = process.argv[4]  // example "http://127.0.0.0:3000"
var lantype = process.argv[5]


meteorDown.init(function (Meteor) {
  console.log( user +  " submit ***********")

  Meteor.call('docker.performanceTest',
    { 
       code: 'print "submit by' + user +  '"',
       input: 'hahaha',
       langType: lantype
    }, 
    function (error, result) {
      console.log(arguments);
      console.log(error);
      console.log(result);

      
      setTimeout(function(){
        console.log("User leave")
        Meteor.kill();
      }, 10000);
    });
});

meteorDown.run({
  concurrency: 1,
  url: url
});
