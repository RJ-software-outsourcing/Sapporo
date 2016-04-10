/*
    Common Library for Docker
*/

const testFileName = 'testing';

const commandForImage = function (lang, filename) {
    let stringArray = [];
    let preArg = [];
    let postArg = [];
    if (lang.preArg) {
        preArg = lang.preArg.split(' ');
    }
    if (lang.postArg) {
        postArg = lang.postArg.split(' ');
    }
    let filePath = lang.mountPath + filename;
    stringArray.push(lang.executable);
    stringArray = stringArray.concat(preArg);
    stringArray.push(filePath);
    stringArray = stringArray.concat(postArg);
    return stringArray;
};
const commandForTest = function (lang) {
    return commandForImage(lang, testFileName);
};

export {commandForImage, commandForTest, testFileName};
