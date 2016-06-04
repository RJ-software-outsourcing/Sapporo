# Sapporo <img src="https://travis-ci.org/catsass19/Sapporo.svg?branch=master"/>
Sapporo is a web app for hosting online coding competition

#####How to run
It's based on Meteor.js. So just run it like other Meteor projects
```
meteor npm install
meteor
```

#####Use docker image
Docker image is also available
```
docker pull sapporo/sapporo:latest
```
Command to run in docker. Please be aware that there are three mandatory EVs to be configured <br>
More detail please read /sapporo/bundle/README (in the container)
```
docker run -d -p 3000:80 \
-e MONGO_URL=mongodb://<user>:<password>@<mongourl>:<port>/<db> \
-e ROOT_URL=<your root url> \
-e PORT=80 \
sapporo/sapporo /bin/bash -c "node /sapporo/bundle/main.js"
```
