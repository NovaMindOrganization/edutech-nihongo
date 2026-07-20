# syntax=docker/dockerfile:1
# Deps in image; source bind-mounted. Build SPA then serve with nginx.
FROM node:20-bookworm-slim
RUN apt-get update \
  && apt-get install -y --no-install-recommends nginx \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Debian nginx package ships sites-enabled/default ("Welcome to nginx!") — remove it.
RUN rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-available/default

ARG VITE_API_BASE_URL=
ARG VITE_APP_TITLE=NihongoCoach
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_APP_TITLE=$VITE_APP_TITLE

EXPOSE 80
# Rebuild dist from mounted source, then serve (only conf.d SPA config)
CMD ["sh", "-c", "rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-available/default; pnpm run build && rm -rf /usr/share/nginx/html/* && cp -r dist/* /usr/share/nginx/html/ && nginx -g 'daemon off;'"]
