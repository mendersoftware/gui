FROM node:11.6.0-alpine AS build
WORKDIR /usr/src/app
COPY package-lock.json package.json ./
RUN npm install
COPY . ./
RUN npm run build
RUN npm run disclaim

FROM alpine:3.4
COPY ./entrypoint.sh /entrypoint.sh
COPY httpd.conf /etc/httpd.conf
EXPOSE 80

RUN mkdir -p /var/www/mender-gui
WORKDIR /var/www/mender-gui/dist/

RUN apk update && apk add nodejs
RUN npm config set unsafe-perm true
RUN npm install -g uglify-js
RUN npm config set unsafe-perm false
COPY --from=build /usr/src/app/dist .

ENTRYPOINT ["/entrypoint.sh"]
