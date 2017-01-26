FROM alpine:3.4

COPY ./entrypoint.sh /entrypoint.sh
COPY httpd.conf /etc/httpd.conf
RUN mkdir -p /var/www/mender-gui
COPY dist/ /var/www/mender-gui/dist/

WORKDIR /var/www/mender-gui/dist/

ENTRYPOINT ["/entrypoint.sh"]