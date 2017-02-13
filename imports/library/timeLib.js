/*
    This is the common library for time management
    and it can be use for both client and server.
*/

const generateDate = function (baseDate, year, month, day=1, hour=0, minute=0, second=0) {
    if (!(baseDate instanceof Date)) {
        return null;
    } else {
        let time = new Date(baseDate.getTime()); //Update everything base on baseDate
        time.setFullYear(year);
        time.setMonth(month);
        time.setDate(day);
        time.setHours(hour);
        time.setMinutes(minute);
        time.setSeconds(second);
        return time;
    }
};

const timeSchedule = function (now, start, end) {

    let hadStarted = Math.ceil((start.getTime() - now.getTime())/1000);
    let hadEnded   = Math.ceil((end.getTime() - now.getTime())/1000);

    let returnObj = {
        start:    false,
        end:      false,
        isCoding: isCoding(now, start, end),
        time: {
            min: 0,
            sec: 0
        }
    };
    if (hadStarted >= 0) { // Not started yet
        returnObj.time = {
            min: Math.floor(hadStarted/60),
            sec: hadStarted % 60
        };
    } else if (hadStarted < 0 && hadEnded >= 0) { // In Game
        returnObj.time = {
            min: Math.floor(hadEnded/60),
            sec: hadEnded % 60
        };
        returnObj.start = true;
    } else { // After Game
        returnObj.start = true;
        returnObj.end = true;
    }

    return returnObj;
};

const isCoding = function (now, start, end) {
    if (!now || !start || !end) {
        return false;
    }
    let hadStarted = Math.ceil((start.getTime() - now.getTime())/1000);
    let hadEnded   = Math.ceil((end.getTime() - now.getTime())/1000);
    return (hadStarted < 0 && hadEnded >= 0)? true:false;
};

const timeDiffSecond = function (pre, now) {
    return ((now.getTime() - pre.getTime())/1000);
};

/*
    Returns null if 'now' is not in between start and end, otherwise returns integer.
*/
const minutesAfterGameStart = function (start, end, now) {
    if (!start || !end || !now) {
        return null;
    }
    let nowTime = now.getTime(), startTime = start.getTime(), endTime = end.getTime();
    if ((nowTime >= startTime) && (nowTime <= endTime)) {
        return Math.ceil(((nowTime - startTime)/1000)/60);
    } else {
        return null;
    }
};

export {timeSchedule, isCoding, timeDiffSecond, generateDate, minutesAfterGameStart};
