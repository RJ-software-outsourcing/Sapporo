/*
    Common Library for Docker
*/

const commandForImage = function (lang, parameter) {
    let stringArray = [];
    let preArg = [];
    let middleArg = [];
    let postArg = [];
    let input = [];
    if (lang.preArg) {
        preArg = lang.preArg.split(' ');
    }
    if (lang.middleArg) {
        middleArg = lang.middleArg.split(' ');
    }
    if (lang.postArg) {
        postArg = lang.postArg.split(' ');
    }
    if (parameter) {
        input = parameter.split(' ');
    }
    let filePath = lang.mountPath + lang.file;
    stringArray.push(lang.executable);
    stringArray = stringArray.concat(preArg);
    stringArray.push(filePath);
    stringArray = stringArray.concat(middleArg);
    if (input.length > 0) {
        stringArray = stringArray.concat(input);
    }
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
