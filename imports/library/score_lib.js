const getTotalScore = function (problem) {
    let score = 0;
    for (var key in problem) {
        if (problem[key].score) {
            score += parseInt(problem[key].score);
        }
    }
    return score;
};

const getUserTotalScore = function (user, problem) {
    let score = 0;
    for (var key in user) {
        for (var index in problem) {
            if (key === problem[index]._id) {
                if (user[key].result) {
                    score += parseInt(problem[index].score);
                }
            }
        }
    }
    return score;
};

const getUserPassedProblem = function (user, problem) {
    let count = 0;
    for (var key in user) {
        for (var index in problem) {
            if (key === problem[index]._id) {
                if (user[key].result) {
                    count += 1;
                }
            }
        }
    }
    return count;
};

const isUserPassedProblem = function (user, problemID) {
    if (user && user[problemID] && user[problemID].result) {
        return true;
    } else {
        return false;
    }
};

const getCurrentUserData = function (id, user) {
    for (var key in user) {
        if (user[key].userID === id) {
            return user[key];
        }
    }
    return null;
};

const problemSolvedCount = function (item, user) {
    let count = 0;
    for (var key in user) {
        if (user[key][item._id] && user[key][item._id].result) {
            count += 1;
        }
    }
    return count;
};

const getFinishTime = function (user) {
    let finishTimes = [];
    for (var key in user) {
        if (user[key].log && Array.isArray(user[key].log) && (user[key].log.length > 0)) {
            let length = user[key].log.length;
            finishTimes.push(((user[key].log)[length-1]).time);
        }
    }
    let latest = null;
    for (var index in finishTimes) {
        if (latest === null) {
            latest = finishTimes[index];
        } else if (finishTimes[index].getTime() > (latest).getTime()) {
            latest = finishTimes[index];
        }
    }
    return latest;
};

export {
    getTotalScore,
    getUserTotalScore,
    getUserPassedProblem,
    getCurrentUserData,
    isUserPassedProblem,
    problemSolvedCount,
    getFinishTime
};
