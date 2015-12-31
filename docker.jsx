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
    var submittedPath = path.join(rootPath, '/submitted');

    if (!fs.existsSync(submittedPath)) {
        console.log('"submitted" folder is created to store user submissions');
        fs.mkdirSync(submittedPath);
    }

    saveScriptToFile = function (username, problemId, lang, code) {
        var userFolder    = path.join(submittedPath, username);
        var problemFolder = path.join(userFolder, problemId);

        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder);
        }
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
        var dockerMountPath = '/usr/src/myapp/';
        var dockerInput = ['python', path.join(dockerMountPath, fileObj.name)].concat(input.split(" "));
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
            console.log(returnData);
            future.return(returnData);
        }).on('container', function (container) {
            container.defaultOptions.start.Binds = [fileObj.folder +':'+ dockerMountPath + ':rw'];
        });
        return future.wait();
    }

    Meteor.methods({
        testCode (code, problemId, lang) {

            var userData = userDataCollection.findOne({username: Meteor.user().username});
            var problemData = Problems.findOne({_id:problemId});
            //console.log(problemId);
            //console.log(problemData.testInput);
            //console.log(problemData.testOutput);
            //console.log(lang);
            var file = saveScriptToFile(Meteor.user().username, problemId, lang, code);
            return execute(docker1, file, lang, problemData.testInput, problemData.testOutput);
        }
    });
}
