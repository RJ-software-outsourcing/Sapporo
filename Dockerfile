FROM node:0.12
MAINTAINER Sapporo
ADD ./Sapporo.tar.gz /sapporo/
RUN cd /sapporo/bundle/programs/server && npm install
