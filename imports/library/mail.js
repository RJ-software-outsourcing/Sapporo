const mailTag = 'mailTag';

let mailRead = JSON.parse(localStorage.getItem(mailTag));
if (!mailRead || (typeof(mailRead) !== 'object')) {
    mailRead = {};
}
localStorage.setItem(mailTag, JSON.stringify(mailRead));

const setMailAsRead = function (item) {
    mailRead[item._id] = true;
    localStorage.setItem(mailTag, JSON.stringify(mailRead));
};

const getNumberOfUnread = function (mailArray) {
    let count = 0;
    let mailRead = JSON.parse(localStorage.getItem(mailTag));

    for (var key in mailArray) {
        if (mailArray[key]._id) {
            if (!mailRead[mailArray[key]._id]) {
                count += 1;
            }
        }
    }
    return count;
};

const isMailRead = function (mail) {
    return mailRead[mail._id]? true:false;
};

export {setMailAsRead, isMailRead, getNumberOfUnread};
