FROM iron/base

RUN mkdir -p /var/www/mender-gui
WORKDIR /var/www/mender-gui

COPY dist/ dist/

WORKDIR dist
CMD ["httpd", "-f", "-p", "80"]
