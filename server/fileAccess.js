import { Meteor } from 'meteor/meteor';
import fs from 'fs';
import path from 'path';

const rootPath = process.env.PWD;
const submittedPath = path.join(rootPath, '../submitted');
const testPath = path.join(rootPath, '../testing');

Meteor.startup(() => {
    if (!fs.existsSync(submittedPath)) {
        fs.mkdirSync(submittedPath);
    }
    if (!fs.existsSync(testPath)) {
        fs.mkdirSync(testPath);
    }
});

const createFiles = function (folderPath, lang, stdinput, script) {
    let inputFile = path.join(folderPath, lang.testInputFile);

    if (fs.existsSync(inputFile)) {
        fs.unlinkSync(inputFile);
    }
    fs.writeFileSync(inputFile, stdinput);
    let scriptFile = path.join(folderPath, lang.file);
    if (fs.existsSync(scriptFile)) {
        fs.unlinkSync(scriptFile);
    }
    fs.writeFileSync(scriptFile, script);

    return folderPath;
};

const createTestingFile = function (lang) {
    if (!lang.file || !lang.testInputFile) {
        return null;
    }
    return createFiles(testPath, lang, lang.testInput, lang.helloworld);
};

const createUserFile = function (data, lang, input) {
    if (!lang.file || !data) {
        return null;
    }
    let userPath = path.join(submittedPath, data.user._id);
    if (!fs.existsSync(userPath)) {
        fs.mkdirSync(userPath);
    }
    return createFiles(userPath, lang, input, data.code);
};


export {createTestingFile, createUserFile};
