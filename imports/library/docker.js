/*
    Common Library for Docker
*/

const commandForImage = function (lang) {
    let stringArray = [];
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

const commandForTest = function (lang) {
    return commandForImage(lang, lang.testInput);
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

export {commandForImage, commandForTest, resultCompare};
