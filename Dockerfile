FROM node:7.8.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN yarn

COPY src /usr/src/app/src
COPY schemas /usr/src/app/schemas
COPY migrations /usr/src/app/migrations

EXPOSE 3000
CMD [ "yarn", "start" ]
