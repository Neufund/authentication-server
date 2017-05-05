FROM node:7.10.0-alpine

# Metadata
ARG VERSION
ARG VCS_REF
ARG BUILD_DATE
LABEL org.label-schema.vendor="Neufund" \
      org.label-schema.url="https://neufund.org" \
      org.label-schema.name="Authentication Server" \
      org.label-schema.description="JWT Authentication server using email, password, captcha and Google Authenticator" \
      org.label-schema.version="0.0.1" \
      org.label-schema.vcs-url="https://github.com/Neufund/authentication-server" \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.docker.schema-version="1.0"

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
