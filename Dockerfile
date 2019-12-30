FROM node:12.14.0-alpine AS build
WORKDIR /usr/src/app
COPY package-lock.json package.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM nginx:1.17-alpine
RUN mkdir -p /var/www/mender-gui/dist
WORKDIR /var/www/mender-gui/dist
ARG GIT_REF
ARG GIT_COMMIT
ENV GIT_REF="${GIT_REF:-local}" GIT_COMMIT="${GIT_COMMIT:-local}"

COPY ./entrypoint.sh /entrypoint.sh
COPY httpd.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist .

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx"]