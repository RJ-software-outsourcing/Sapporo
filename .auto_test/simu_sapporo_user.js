var user = process.argv[3]
var url = process.argv[4]  // example "http://127.0.0.0:3000"
var lantype = process.argv[5]
var delaytime = process.argv[6]

if (!delaytime) {
  delaytime=3000
}

function logMessage(msg){
  var fs = require('fs');
  fs.appendFileSync( "./" + user, msg, 'utf8'  ); 
}

meteorDown.init(function (Meteor) {

  Meteor.call('docker.performanceTest',
    { 
       code: 'print "submit by' + user +  '"',
       input: 'hahaha',
       langType: lantype
    }, 
    function (error, result) {

      if(error){
        logMessage("Error with Meteor\n");
      }
      
      if(  result.indexOf("submit") < 0 ){
        logMessage("Error " + result);
      }     

      setTimeout(function(){
        Meteor.kill();
      }, delaytime);
    });
});

meteorDown.run({
  concurrency: 1,
  url: url
});
