if (Meteor.isServer) {
    Future = Meteor.npmRequire('fibers/future');
    docker = Meteor.npmRequire('dockerode');
    docker1 = new docker();

    Meteor.methods({
        dockerRunSample (code, problemId) {
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
            console.log(userData);

            docker1.run('ubuntu', ['bash', '-c', 'uname -a'], [stdout, stderr], {Tty:false}, function (err, data, container) {
                future.return(output);
            });
            return future.wait();
        }
    });

}
