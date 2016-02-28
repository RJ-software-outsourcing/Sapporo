

Timer = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData () {
    var data = {
      timeMessage: (timeSync.findOne({timeSync: true}))
    }
    return data;
  },
  displayMessage () {
    if (this.data.timeMessage) {
      return this.data.timeMessage;
    } else {
      return {
        message: "Timer hasn't been initialized",
        coding: false
      };
    }
  },
  render() {
    return (
      <div className="Timer">
        {(this.displayMessage()).coding?
          <span className="inCodewar">Game is ON</span>:<span>STOP</span>
        }
        <br/>
        <span>{(this.displayMessage()).message}</span>
      </div>
    );
  }
});

if (Meteor.isServer) {

  function getStartTime (timeSetting) {
    var _time = (new Date);
    _time.setHours(timeSetting.startHour); //Start CodeWar in every hour
    _time.setMinutes(timeSetting.startMinute);
    _time.setSeconds(0);
    return _time;
  };

  function getEndTime (timeSetting) {
    var _time = (new Date);
    _time.setHours(timeSetting.endHour); //End CodeWar in every hour
    _time.setMinutes(timeSetting.endMinute);
    _time.setSeconds(0);
    return _time;
  };

  function codewarSchedule () {
    var now = (new Date);
    var timeSetting = timeSync.findOne({timeSync:true});
    var start = getStartTime(timeSetting);
    var end = getEndTime(timeSetting);

    var started = Math.ceil((start.getTime() - now.getTime())/1000);
    var ended = Math.ceil((end.getTime() - now.getTime())/1000);

    var message = 'unknown';
    var coding = false;

    if (started >= 0) {
      message = 'CodeWar Starts in: ' + Math.floor(started/60) + 'min ' + (started%60) + 'sec';
      coding = false;
    } else if (started < 0 && ended >= 0) {
      message = 'Remaining Time: ' + Math.floor(ended/60) + 'min ' + (ended%60) + 'sec';
      coding = true;
    } else {
      message = 'CodeWar Ends'
      coding = false;
    }

    return {
      message: message,
      coding: coding
    }
    //console.log(message);
  }

  function updateTime () {
    var schedule = codewarSchedule();
    var _time = (new Date).getUTCMinutes();
    //console.log(getStartTime());
    timeSync.update({
      timeSync: true
    }, {
      $set: {
        message: schedule.message,
        coding: schedule.coding
      }
    });
    Meteor.setTimeout(updateTime, 1000);
  };

  Meteor.startup(function () {
    // code to run on server at startup

    if ( (timeSync.find({timeSync: true}).fetch()).length === 0 ) {
      timeSync.insert({
        timeSync: true,
        message: "counter created without initial value",
        coding: false
      });
    }

    updateTime();

  });



}
