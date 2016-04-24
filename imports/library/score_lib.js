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

export {
    getTotalScore,
    getUserTotalScore,
    getUserPassedProblem,
    getCurrentUserData,
    isUserPassedProblem,
    problemSolvedCount
};
