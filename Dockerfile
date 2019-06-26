FROM node:11.6.0-alpine AS build
WORKDIR /usr/src/app
COPY package-lock.json package.json ./
RUN npm install
COPY . ./
RUN npm run build
RUN npm run disclaim

FROM nginx:1.17-alpine
RUN mkdir -p /var/www/mender-gui/dist
WORKDIR /var/www/mender-gui/dist

COPY ./entrypoint.sh /entrypoint.sh
COPY httpd.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist .

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx"]