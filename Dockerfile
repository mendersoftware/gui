FROM alpine:3.4

COPY ./set_gateway_host.sh /root/
RUN chmod +x /root/set_gateway_host.sh

COPY httpd.conf /etc/httpd.conf

RUN mkdir -p /var/www/mender-gui
WORKDIR /var/www/mender-gui

COPY dist/ dist/

WORKDIR dist

CMD ["/bin/sh", "-c", "/root/set_gateway_host.sh ./js/main.js && httpd -f -p 80 -c /etc/httpd.conf"]
