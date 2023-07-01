FROM node:20.2.0-alpine AS base
WORKDIR /usr/src/app
COPY package-lock.json package.json ./
RUN npm ci

FROM mendersoftware/gui:base AS disclaim
RUN npm run disclaim

FROM base AS build
COPY . ./
RUN npm run build


FROM nginxinc/nginx-unprivileged:1.25.0-alpine AS unprivileged
EXPOSE 8090
WORKDIR /var/www/mender-gui/dist
ARG GIT_COMMIT_TAG
ENV GIT_COMMIT_TAG=$GIT_COMMIT_TAG
COPY --from=build /usr/src/app/dist .
COPY ./entrypoint.sh /usr/src/entrypoint.sh
COPY httpd.conf /etc/nginx/nginx.conf
RUN sed -i 's|/var/run/nginx.pid|/tmp/nginx.pid|g' /etc/nginx/nginx.conf && sed -i 's|listen 80;|listen 8090;|g' /etc/nginx/nginx.conf
ENTRYPOINT ["/usr/src/entrypoint.sh"]
HEALTHCHECK --interval=8s --timeout=15s --start-period=120s --retries=128 CMD wget --quiet --tries=1 --spider --output-document=/dev/null 127.0.0.1
CMD ["nginx"]


FROM nginx:1.25.1-alpine AS production
EXPOSE 8080
WORKDIR /var/www/mender-gui/dist
ARG GIT_COMMIT_TAG
ENV GIT_COMMIT_TAG=$GIT_COMMIT_TAG
COPY ./entrypoint.sh /usr/src/entrypoint.sh
COPY httpd.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist .
ENTRYPOINT ["/usr/src/entrypoint.sh"]
HEALTHCHECK --interval=8s --timeout=15s --start-period=120s --retries=128 CMD wget --quiet --tries=1 --spider --output-document=/dev/null 127.0.0.1
CMD ["nginx"]
