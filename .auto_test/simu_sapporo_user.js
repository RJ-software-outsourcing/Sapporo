
var testQuestions = {
  p2:{
    name: "python2 success",
    lang: "",
    code: 'print "submit test"'      
  },
  c:{
    name: "C success",
    lang: "",
    code: '#include<stdio.h>\n void main(){printf("submit test C");}' 
  },
  cError:{
    name: "C compile Error",
    lang: "",
    code: '#include<stdio.h>\n void main(){printf("submit test C");}' 
  }
};

var codeCollection=[];


var user = ""
var url = ""  // example "http://127.0.0.0:3000"
var delaytime = ""

var user = "error.log"

if (process.argv.length < 5){

  if ("-h" == process.argv[3]){
    console.log("Usage: ");
    console.log("  meteor-down simu_sapporo_user.js <user> <url> [-t <delay time> -lc <c ID> -lp2 <python2 ID> -lj <java ID>]");
    console.log("  Ex:");
    console.log("    meteor-down simu_sapporo_user.js aaa http://localhost:4000 -t 3000 -lc KELLL581KSCxxPP -lp2 iK59adkaokwa -lj sefjislIKJLLL");
    process.exit(0)
  }
}

if (process.argv.length < 7){
  logMessage("too few argument")    
  process.exit(1); 
}

process.argv.forEach(function(ele, idx){

  var ltype = ""

  if( 3 == idx ){
    user =  process.argv[idx] 
  }else if(4 == idx){
    url = process.argv[idx]
  }else if( 4 < idx){
     // Parse option -t -lc -lcpp -lp2 -lp3 -lj
    if ("-t" == ele){
      delaytime = process.argv[idx + 1];
    }else if ("-lc" == ele){
      ltype = process.argv[idx + 1];
      testQuestions.c.lang = ltype;
      codeCollection.push(testQuestions.c);
      testQuestions.cError.lang = ltype;
      codeCollection.push(testQuestions.cError);
    }else if ("-lcpp" == ele){

      console.log("cpp ID: " + process.argv[idx + 1])

    }else if ("-lp2" == ele){
      ltype = process.argv[idx + 1];
      testQuestions.p2.lang = ltype;
      codeCollection.push(testQuestions.p2);

    }else if ("-lp3" == ele){
      console.log("python 3 ID: " + process.argv[idx + 1])

    }else if ("-lj" == ele){
      console.log("java ID: " + process.argv[idx + 1])
    }
  }
});

var maxQuest = codeCollection.length;

// To do: keep log message in arrage and output every 10 reocrds.
// If user interrupt it. Write all log to file and exit.
process.on('SIGINT', () =>{
  console.log('Received SIGINT.');
  process.exit();
})


if (!delaytime) {
  delaytime=3000
}

function logMessage(msg){
  var fs = require('fs');
  fs.appendFileSync( "./" + user, msg + '\n', 'utf8'  ); 
}


var startTime=0
function StartMesureTime(){
  startTime = (new Date).getTime();
}

function EndMesureTime(){
  var diffms = (new Date).getTime() - startTime;
  var diffSec = diffms/1000

  logMessage( diffms + "ms"  );
}

function GetATestCode(){
  var idx = Math.floor(Math.random() * maxQuest);
  console.log(idx);
  return codeCollection[idx];
}

meteorDown.init(function (Meteor) {

  StartMesureTime();
  var testCode = GetATestCode();
  logMessage(testCode.name + "  ");

  Meteor.call('docker.performanceTest',
    { 
       code: testCode.code,
       input: 'hahaha',
       langType: testCode.lang
    }, 
    function (error, result) {

      EndMesureTime();

      var endTime = new Date();
      console.log(result);

      if(error){
        logMessage("Error with Meteor\n" + result);
      }      
      else if(  result.indexOf("submit") < 0 ){
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
