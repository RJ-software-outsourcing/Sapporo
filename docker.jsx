if (Meteor.isServer) {

    // Use NPM.require for Native nodeJS modules
    // Use Meteor.npmRequire for third-party NPM moudles installed by Meteor
    fs = Npm.require('fs');
    path = Npm.require('path');
    Future = Meteor.npmRequire('fibers/future');
    docker = Meteor.npmRequire('dockerode');
    stream = Meteor.npmRequire('stream'),
    // This is standard way to get local Docker instance
    // We might do something more advanced to obtain our Docker instance
    // Such as configuring distributed Docker instances via HTTP
    docker1 = new docker();

    rootPath = process.env.PWD;
    var submittedPath = path.join(rootPath, '../submitted');

    if (!fs.existsSync(submittedPath)) {
        console.log('"submitted" folder is created to store user submissions');
        fs.mkdirSync(submittedPath);
    }

    saveScriptToFile = function (username, problemId, isTest, code) {
        var userFolder    = path.join(submittedPath, username);
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder);
        }
        if (isTest) {
            userFolder = path.join(userFolder, 'test');
            if (!fs.existsSync(userFolder)) {
                fs.mkdirSync(userFolder);
            }
        }
        var problemFolder = path.join(userFolder, problemId);

        if (!fs.existsSync(problemFolder)) {
            fs.mkdirSync(problemFolder);
        }

        var fileName = (fs.readdirSync(problemFolder).length + 1).toString() + '.txt';
        fs.writeFileSync(path.join(problemFolder, fileName), code);
        return {
            folder: problemFolder,
            name: fileName
        };
    };

    resultCompare = function (output, expectedOutput) {
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

    updateResult = function (user, problemId, file, isSuccess) {
        var result = {};
        var alreadyPass = false; //Use this var because ForEach is unbreakable.
        user.pass.forEach(function (item) {
            console.log(item);
            if (item === problemId) {
                console.log('Not updating. Already pass problem: ' + problemId);
                alreadyPass = true;
            }
        });
        if (alreadyPass) {
            return false;
        }
        result[problemId] = user[problemId];
        result[problemId].push({
            success: isSuccess,
            file: path.join(file.folder, file.name)
        });
        if (isSuccess) {
            result.pass = user.pass;
            result.pass.push(problemId);
        }
        userDataCollection.update({
            _id:user._id
        }, {
            $set: result
        });
        console.log(userDataCollection.findOne({username: user.username}));
    };

    execute = function (dockerObj, fileObj, lang, input, expectedOutput) {
        var future = new Future(),
            stdout = stream.Writable(),
            stderr = stream.Writable(),
            output = '',
            err    = '';
        stdout._write = function (chunk, encoding, done) {
            output = output + chunk.toString();
            done();
        };
        stderr._write = function (chunk, encoding, done) {
            err = err + chunk.toString();
            done();
        };
        if (typeof(input) !== 'string') {
            input = '';
        }
        var dockerMountPath = '/usr/src/myapp/';
        var dockerInput = ['timeout', '3', 'python', path.join(dockerMountPath, fileObj.name)].concat(input.split(" "));
        dockerObj.run('python', dockerInput,
            [stdout, stderr], {Tty:false}, function (error, data, container) {
            var returnData = {
                isSuccess: false,
                expectedOutput: expectedOutput,
                input: input
            }
            if (err) { //Error from container
                returnData.err = err;
            } else if (error) { //Error from Docker
                returnData.err = error.toString();
            } else if (output) {
                returnData.isSuccess = resultCompare(output, expectedOutput);
                returnData.output = output;
            } else {
                returnData.err = 'No result';
            }
            //console.log(returnData);
            future.return(returnData);
        }).on('container', function (container) {
            container.defaultOptions.start.Binds = [fileObj.folder +':'+ dockerMountPath + ':rw'];
        });
        return future.wait();
    };

    Meteor.methods({
        testCode (code, problemId, lang) {
            var userData = userDataCollection.findOne({username: Meteor.user().username});
            var problemData = Problems.findOne({_id:problemId});
            var isTest = true;
            var file = saveScriptToFile(Meteor.user().username, problemId, isTest, code);
            return execute(docker1, file, lang, problemData.testInput, problemData.testOutput);
        },
        submitCode (code, problemId, lang) {
            var userData = userDataCollection.findOne({username: Meteor.user().username});
            var problemData = Problems.findOne({_id:problemId});
            var isTest = false;
            var file = saveScriptToFile(Meteor.user().username, problemId, isTest, code);
            if (!(problemData.verificationCases) || problemData.verificationCases.length <= 0) {
                console.log('There is no data to verify for problem: ' + problemId);
                return false;
            }
            for (var key in problemData.verificationCases) {
                var item = problemData.verificationCases[key];
                console.log(item);
                var result = execute(docker1, file, lang, item.input, item.output);
                if (!result.isSuccess) {
                    console.log('submit failed');
                    updateResult(userData, problemId, file, false);
                    return false;
                }
            }
            console.log('submit pass');
            updateResult(userData, problemId, file, true);
            return true;
        }
    });
}
