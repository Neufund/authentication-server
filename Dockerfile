FROM node:7.10.0-alpine

WORKDIR /usr/src/app
COPY package.json yarn.lock /usr/src/app/
COPY src /usr/src/app/src
COPY schemas /usr/src/app/schemas
COPY migrations /usr/src/app/migrations

RUN \
  apk add --update --no-cache --virtual build-deps build-base python &&\
  yarn install --production --frozen-lockfile --non-interactive &&\
  yarn cache clean &&\
  apk del --purge build-deps

EXPOSE 3000
CMD [ "yarn", "start" ]
