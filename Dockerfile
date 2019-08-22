FROM node:11.6.0-alpine AS build
WORKDIR /usr/src/app
COPY package-lock.json package.json ./
RUN npm ci
COPY . ./
RUN npm run build
RUN npm run disclaim
RUN apk add --no-cache git && echo "$(git rev-parse --abbrev-ref HEAD)-$(git rev-parse --short HEAD)" >> version

FROM nginx:1.17-alpine
RUN mkdir -p /var/www/mender-gui/dist
WORKDIR /var/www/mender-gui/dist

COPY ./entrypoint.sh /entrypoint.sh
COPY httpd.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist .
COPY --from=build /usr/src/app/version .

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx"]