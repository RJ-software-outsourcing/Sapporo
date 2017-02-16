var user = process.argv[3]
var url = process.argv[4]  // example "http://127.0.0.0:3000"
var lantype = process.argv[5]
var delaytime = process.argv[6]

if (!delaytime) {
  delaytime=3000
}


console.log(user)
console.log(url)
console.log(lantype)
console.log(delaytime)

meteorDown.init(function (Meteor) {
  console.log( user +  " submit ***********")

  Meteor.call('docker.performanceTest',
    { 
       code: 'print "submit by' + user +  '"',
       input: 'hahaha',
       langType: lantype
    }, 
    function (error, result) {

      if(!error){
        console.log("\trequest succeful");
      }else{
        console.log("\t" + error)
      }
      console.log("\t"+result);

      console.log(new Date());
      
      setTimeout(function(){
        console.log(new Date());
        console.log("User leave")
        Meteor.kill();
      }, delaytime);
    });
});

meteorDown.run({
  concurrency: 1,
  url: url
});
