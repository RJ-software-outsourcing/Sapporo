/*
    This is the common library for time management
    and it can be use for both client and server.
*/


const startTime = function (time) {
    let _time = (new Date);
    _time.setHours(time.start.hr); //Start CodeWar in every hour
    _time.setMinutes(time.start.min);
    _time.setSeconds(0);
    return _time;
};

const endTime = function (time) {
    let _time = (new Date);
    _time.setHours(time.end.hr); //Start CodeWar in every hour
    _time.setMinutes(time.end.min);
    _time.setSeconds(0);
    return _time;
};

const timeSchedule = function (now, timeSetting) {
    let start = startTime(timeSetting);
    let end = endTime(timeSetting);

    let hadStarted = Math.ceil((start.getTime() - now.getTime())/1000);
    let hadEnded   = Math.ceil((end.getTime() - now.getTime())/1000);

    let returnObj = {
        start:    false,
        end:      false,
        isCoding: false,
        time: {
            min: 0,
            sec: 0
        }
    };
    if (hadStarted >= 0) {
        returnObj.time = {
            min: Math.floor(hadStarted/60),
            sec: hadStarted % 60
        };
    } else if (hadStarted < 0 && hadEnded >= 0) {
        returnObj.time = {
            min: Math.floor(hadEnded/60),
            sec: hadEnded % 60
        };
        returnObj.start = true;
        returnObj.isCoding = true;
    } else {
        returnObj.start = true;
        returnObj.end = true;
    }

    return returnObj;
};

const isCoding = function (now, timeSetting) {
    let start = startTime(timeSetting);
    let end = endTime(timeSetting);
    let hadStarted = Math.ceil((start.getTime() - now.getTime())/1000);
    let hadEnded   = Math.ceil((end.getTime() - now.getTime())/1000);
    return (hadStarted < 0 && hadEnded >= 0)? true:false;
};

const timeDiffSecond = function (pre, now) {
    return ((now.getTime() - pre.getTime())/1000);
};

export {timeSchedule, isCoding, timeDiffSecond};
