/*
    Common Library for Docker
*/

const testFileName = 'testing';

const commandForImage = function (lang, parameter) {
    let stringArray = [];
    let preArg = [];
    let postArg = [];
    let input = [];
    if (lang.preArg) {
        preArg = lang.preArg.split(' ');
    }
    if (lang.postArg) {
        postArg = lang.postArg.split(' ');
    }
    if (parameter) {
        input = parameter.split(' ');
    }
    let filePath = lang.mountPath + testFileName;
    stringArray.push(lang.executable);
    stringArray = stringArray.concat(preArg);
    stringArray.push(filePath);
    if (input.length > 0) {
        stringArray = stringArray.concat(input);
    }
    stringArray = stringArray.concat(postArg);
    return stringArray;
};

const commandForTest = function (lang) {
    return commandForImage(lang, 'helloworld', testFileName);
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

export {commandForImage, commandForTest, testFileName, resultCompare};
