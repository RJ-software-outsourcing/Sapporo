if (Meteor.isServer) {

    fs = Npm.require('fs');
    path = Npm.require('path');
    Future = Meteor.npmRequire('fibers/future');
    docker = Meteor.npmRequire('dockerode');
    docker1 = new docker();

    rootPath = process.env.PWD;
    var submittedPath = path.join(rootPath, '/submitted');

    if (!fs.existsSync(submittedPath)) {
        console.log('"submitted" folder is created to hold user submissions');
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

    Meteor.methods({
        dockerRunSample (code, problemId, lang) {
            var future = new Future(),
                stream = Meteor.npmRequire('stream'),
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
            var userData = userDataCollection.findOne({username: Meteor.user().username});
            console.log(problemId);
            console.log(lang);

            var file = saveScriptToFile(Meteor.user().username, problemId, lang, code);
            var dockerMountPath = '/usr/src/myapp/';
            docker1.run('python', ['python', path.join(dockerMountPath, file.name)],
                [stdout, stderr], {Tty:false}, function (error, data, container) {
                if (err) { //Error from container
                    future.return(err);
                } else if (error) { // Error from Docker
                    future.return(error.toString());
                } else if (output) {
                    future.return(output);
                } else {
                    future.return('UNKNOWN DOCKER ERROR');
                }

            }).on('container', function (container) {
                container.defaultOptions.start.Binds = [file.folder +':'+ dockerMountPath + ':rw'];
            });
            return future.wait();
        }
    });
}

/*
docker run -it --rm -v "$PWD":/usr/src/myapp -w /usr/src/myapp python python test.py
*/
