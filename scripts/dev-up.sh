#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "[1/5] Docker infra (ports 5434, 6380, 9002/9003)..."
docker compose up -d --force-recreate

echo "[2/5] Wait for Postgres..."
for i in $(seq 1 30); do
  if docker exec edutech-nihongo-postgres-1 pg_isready -U postgres -d app >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "[3/5] Prisma migrate + seed..."
cd server/app-server
pnpm exec prisma migrate deploy
pnpm db:seed

echo "[4/5] Done. Start apps in separate terminals:"
echo "  cd server/app-server && pnpm dev"
echo "  cd client && pnpm dev"
echo "  cd server/ai-server && uvicorn app.main:app --reload --port 8000"
