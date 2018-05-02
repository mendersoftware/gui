FROM alpine:3.4

COPY ./entrypoint.sh /entrypoint.sh

EXPOSE 80

COPY httpd.conf /etc/httpd.conf
RUN apk update && apk add nodejs
RUN npm config set unsafe-perm true
RUN npm install -g uglify-js
RUN npm config set unsafe-perm false
RUN mkdir -p /var/www/mender-gui
COPY dist/ /var/www/mender-gui/dist/

WORKDIR /var/www/mender-gui/dist/

ENTRYPOINT ["/entrypoint.sh"]
