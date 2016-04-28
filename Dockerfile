FROM node:0.12
MAINTAINER Sapporo
ADD ./Sapporo.tar.gz /sapporo/
RUN apt-get update
RUN apt-get install build-essential
RUN cd /sapporo/bundle/programs/server && npm install
