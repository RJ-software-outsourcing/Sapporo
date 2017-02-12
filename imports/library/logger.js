import { requestLogs } from '../api/db.js';

const logReason = {
    reachMaxmimum: 'reachMaxmimum',
    success: 'success',
    resultNotStr: 'resultNotStr',
    gameStop: 'gameStop',
    noLang: 'noLang'
};

const logRequest = function (type, data) {
    requestLogs.insert({
        type: type,
        data: data,
        createdAt: new Date()
    });
};

export { logReason, logRequest };
