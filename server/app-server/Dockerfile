# syntax=docker/dockerfile:1
# Runtime image holds deps; source is bind-mounted from host on VPS.
FROM node:20-bookworm-slim
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile \
  && pnpm exec prisma generate

# Seed copy — overwritten by bind mount of ./server/app-server:/app
COPY . .

ENV NODE_ENV=production
EXPOSE 4000
# migrate + tsx watch so bind-mounted .ts reloads without image rebuild
CMD ["sh", "-c", "pnpm exec prisma generate && pnpm exec prisma migrate deploy && pnpm exec tsx watch server.ts"]
