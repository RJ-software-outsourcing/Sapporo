const lockName = 'sapporoRefreshControl';

const setLock = function () {
    localStorage.setItem(lockName, 'true');
};

const freeLock = function () {
    localStorage.setItem(lockName, 'false');
};

const isLock = function () {
    return (localStorage.getItem(lockName) === 'true')? true:false;
};

export {setLock, freeLock, isLock};
