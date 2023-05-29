FROM node:20.0.0-alpine AS base
WORKDIR /usr/src/app
COPY package-lock.json package.json ./
RUN npm ci

FROM mendersoftware/gui:base AS disclaim
RUN npm run disclaim

FROM base AS build
COPY . ./
RUN npm run build

FROM nginx:1.23.4-bullseye
EXPOSE 8080
WORKDIR /var/www/mender-gui/dist
ARG GIT_COMMIT_TAG
ENV GIT_COMMIT_TAG="${GIT_COMMIT_TAG:-local_local}"
ARG NGINX_PORT
ENV NGINX_PORT=${NGINX_PORT:-9080}

RUN apt-get update && apt-get install -y --no-install-recommends \
  wget \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

COPY httpd.conf /etc/nginx/nginx.conf

RUN mkdir /app
RUN chown -R nginx:nginx /app && chmod -R 755 /app && \
        chown -R nginx:nginx /var/cache/nginx && \
        chown -R nginx:nginx /var/log/nginx && \
        chown -R nginx:nginx /var/www && \
        chown -R nginx:nginx /etc/nginx
RUN touch /var/run/nginx.pid && \
        chown -R nginx:nginx /var/run/nginx.pid

# Uncomment this when rootless ready
#USER nginx

COPY ./entrypoint.sh /app/entrypoint.sh
COPY --from=build --chown=nginx:nginx /usr/src/app/dist .

RUN sed -i -e 's/$NGINX_PORT/'"$NGINX_PORT"'/g' /etc/nginx/nginx.conf

ENTRYPOINT ["/app/entrypoint.sh"]
HEALTHCHECK --interval=8s --timeout=15s --start-period=120s --retries=128 CMD wget --quiet --tries=1 --spider --output-document=/dev/null 127.0.0.1
CMD ["nginx"]
