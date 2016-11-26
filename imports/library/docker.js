/*
    Common Library for Docker
*/

const commandForImage = function (lang, timeout) {
    let stringArray = [];
    if (!isNaN(timeout)&&(timeout > 0)) {
        stringArray.push('timeout');
        stringArray.push(timeout);
    }
    let preArg = [];
    let middleArg = [];
    let postArg = [];
    if (lang.preArg) {
        preArg = lang.preArg.split(' ');
    }
    if (lang.middleArg) {
        middleArg = lang.middleArg.split(' ');
    }
    if (lang.postArg) {
        postArg = lang.postArg.split(' ');
    }
    let filePath = lang.mountPath + lang.file;
    let testFile = lang.mountPath + lang.testInputFile;
    stringArray.push(lang.executable);
    stringArray = stringArray.concat(preArg);
    stringArray.push(filePath);
    stringArray = stringArray.concat(middleArg);
    stringArray.push(testFile);
    stringArray = stringArray.concat(postArg);
    return stringArray;
};

const commandForTest = function (lang, timeout) {
    return commandForImage(lang, timeout);
};

const resultCompare = function (output, expectedOutput) {
    if (typeof(output) !== 'string' || typeof(expectedOutput) !== 'string') {
        return false;
    }
    if (expectedOutput.localeCompare(output) === 0) {
        return true;
    } else {
        expectedOutput = expectedOutput.trim().replace(/\n$/, '');
        output = output.trim().replace(/\n$/, '');
        if(expectedOutput.localeCompare(output) === 0) {
            return true;
        } else {
            return false;
        }
    }
};

const allInOneCommand = function (lang, code, input, timeout) {
    let strArray = [];

    code = code.replace(/"/g, '\\"');
    input = input.replace(/"/g, '\\"');
    let saveCodeFile  = ['echo', '"'+code+'"', '>', './'+lang.file];
    let saveInputFile = ['echo', '"'+input+'"','>', './'+lang.testInputFile];
    let preArg = [];
    let middleArg = [];
    let postArg = [];
    if (lang.preArg) {
        preArg = lang.preArg.split(' ');
    }
    if (lang.middleArg) {
        middleArg = lang.middleArg.split(' ');
    }
    if (lang.postArg) {
        postArg = lang.postArg.split(' ');
    }
    strArray = strArray.concat(saveCodeFile);
    strArray.push('&&');
    strArray = strArray.concat(saveInputFile);
    strArray.push('&&');
    if (!isNaN(timeout)&&(timeout > 0)) {
        strArray.push('timeout');
        strArray.push(timeout);
    }
    strArray.push(lang.executable);
    strArray = strArray.concat(preArg);
    strArray.push(lang.file);
    strArray = strArray.concat(middleArg);
    strArray.push(lang.testInputFile);
    strArray = strArray.concat(postArg);
    return strArray;
};

export {commandForImage, commandForTest, resultCompare, allInOneCommand};
