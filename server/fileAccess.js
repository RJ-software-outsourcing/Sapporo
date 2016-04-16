import { Meteor } from 'meteor/meteor';
import fs from 'fs';
import path from 'path';

import { testFileName } from '../imports/library/docker.js';

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

const createTestingFile = function (lang) {
    let testFile = path.join(testPath, testFileName);
    if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
    }
    fs.writeFileSync(testFile, lang.helloworld);
    return testPath;
};

const createUserFile = function (data) {
    let userPath = path.join(submittedPath, data.user._id);
    let userFile = path.join(userPath, testFileName);
    if (!fs.existsSync(userPath)) {
        fs.mkdirSync(userPath);
    }
    if (fs.existsSync(userFile)) {
        fs.unlinkSync(userFile);
    }
    fs.writeFileSync(userFile, data.code);
    return userPath;
};

export {createTestingFile, createUserFile};
