FROM node:4.6
MAINTAINER Sapporo
ADD ./Sapporo.tar.gz /sapporo/
RUN apt-get update
RUN apt-get -y install build-essential
RUN cd /sapporo/bundle/programs/server && npm install
