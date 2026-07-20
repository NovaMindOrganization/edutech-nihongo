#!/usr/bin/env bash
# VPS deploy helper — run from repo root after git update.
# Usage:
#   scripts/vps-deploy.sh                 # auto-detect rebuild vs reload
#   scripts/vps-deploy.sh --rebuild       # force docker compose build
#   scripts/vps-deploy.sh --reload        # force light reload only
#   BEFORE_SHA=abc scripts/vps-deploy.sh  # compare against sha (CI)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MODE="${1:-auto}"
COMPOSE=(docker compose --env-file .env)

log() { printf '[deploy] %s\n' "$*"; }
die() { printf '[deploy] ERROR: %s\n' "$*" >&2; exit 1; }

[[ -f .env ]] || die "missing .env (cp .env.example .env)"

# --- detect package / image-affecting changes ---
needs_rebuild() {
  local before="${BEFORE_SHA:-}"
  local after="${AFTER_SHA:-HEAD}"

  if [[ "$MODE" == "--rebuild" || "$MODE" == "rebuild" ]]; then
    return 0
  fi
  if [[ "$MODE" == "--reload" || "$MODE" == "reload" ]]; then
    return 1
  fi

  # First deploy / empty before → rebuild
  if [[ -z "$before" || "$before" == "0000000000000000000000000000000000000000" ]]; then
    log "no BEFORE_SHA — full rebuild"
    return 0
  fi

  local pattern='(^|/)(package\.json|pnpm-lock\.yaml|package-lock\.json|yarn\.lock|requirements.*\.txt|Dockerfile|docker-compose\.ya?ml|\.dockerignore)$'
  if git diff --name-only "$before" "$after" | grep -Eq "$pattern"; then
    log "dependency/image files changed → rebuild"
    git diff --name-only "$before" "$after" | grep -E "$pattern" || true
    return 0
  fi
  return 1
}

light_reload() {
  log "light reload (bind-mount + watchers)"

  # Prisma may have new migrations without package change
  if "${COMPOSE[@]}" ps --status running --services 2>/dev/null | grep -qx app-server; then
    log "prisma generate + migrate (app-server)"
    "${COMPOSE[@]}" exec -T app-server sh -c \
      'pnpm exec prisma generate && pnpm exec prisma migrate deploy' || true
  fi

  # Backends: tsx watch / uvicorn --reload usually pick up files alone.
  # Restart worker (tsx watch) + nudge server if watch missed edge cases.
  log "restart app-server app-worker ai-server"
  "${COMPOSE[@]}" restart app-server app-worker ai-server

  # Client SPA: rebuild dist inside container, reload nginx in client image
  if "${COMPOSE[@]}" ps --status running --services 2>/dev/null | grep -qx client; then
    log "rebuild client SPA + nginx reload"
    "${COMPOSE[@]}" exec -T client sh -c \
      'rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-available/default; pnpm run build && rm -rf /usr/share/nginx/html/* && cp -r dist/* /usr/share/nginx/html/ && nginx -s reload' \
      || "${COMPOSE[@]}" up -d --no-deps client
  else
    "${COMPOSE[@]}" up -d --no-deps client
  fi

  # Edge nginx: reload when conf changed (no git in deploy dir after rsync — always cheap reload)
  if [[ -n "${BEFORE_SHA:-}" ]] && git rev-parse --is-inside-work-tree >/dev/null 2>&1 \
    && git diff --name-only "${BEFORE_SHA}" "${AFTER_SHA:-HEAD}" 2>/dev/null | grep -qE '(^|/)nginx/'; then
    log "reload edge nginx (nginx/ changed)"
    "${COMPOSE[@]}" exec -T nginx nginx -t && "${COMPOSE[@]}" exec -T nginx nginx -s reload \
      || "${COMPOSE[@]}" restart nginx
  else
    log "reload edge nginx (safe)"
    "${COMPOSE[@]}" exec -T nginx nginx -s reload 2>/dev/null || true
  fi
}

full_rebuild() {
  log "full rebuild: docker compose up -d --build"
  # Drop nm volumes when packages change so image deps re-seed
  if [[ "${DROP_NM_VOLUMES:-1}" == "1" ]]; then
    log "recreate node_modules volumes"
    "${COMPOSE[@]}" stop app-server app-worker client 2>/dev/null || true
    docker volume rm -f edutech-nihongo_app_server_nm edutech-nihongo_client_nm 2>/dev/null || true
  fi
  "${COMPOSE[@]}" up -d --build --remove-orphans
  # containers may still be starting; CI health step waits with retries
  log "compose up finished — waiting briefly for app-server"
  sleep 8
}

# --- main ---
log "cwd=$ROOT mode=$MODE before=${BEFORE_SHA:-none} after=${AFTER_SHA:-HEAD}"

if needs_rebuild; then
  full_rebuild
else
  light_reload
fi

log "status:"
"${COMPOSE[@]}" ps
log "done"
