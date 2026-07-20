# VPS deploy (self-hosted GitHub Actions → /opt/edutech-nihongo)

Domain: **nihongo.com.vn** (SPA + API same-origin via edge nginx).

## Layout on VPS
| Path | Role |
|------|------|
| `/opt/edutech-nihongo` | App code + compose (CI rsync target) |
| `/etc/edutech-nihongo/env` | Secrets (chmod 600), linked as `.env` |
| `/opt/edutech-nihongo/certbot/` | Let's Encrypt (not wiped by CI) |
| runner `_work/...` | Temporary checkout only — **not** the running stack |

## One-time VPS setup
```bash
sudo mkdir -p /opt/edutech-nihongo /etc/edutech-nihongo
sudo chown -R <runner-user>:<runner-user> /opt/edutech-nihongo
# secrets
sudo cp /path/to/env /etc/edutech-nihongo/env
sudo chmod 600 /etc/edutech-nihongo/env
# DOMAIN=nihongo.com.vn
# CORS_ORIGIN=https://nihongo.com.vn
# APP_PUBLIC_URL=https://nihongo.com.vn
# VITE_API_BASE_URL=   (empty)

# Install self-hosted runner with labels: self-hosted, linux
# usermod -aG docker <runner-user>
```

First stack (if empty):
```bash
cd /opt/edutech-nihongo
ln -sfn /etc/edutech-nihongo/env .env
docker compose up -d --build
```

## CI flow (branch `production`)
1. `actions/checkout` → workspace `src/`
2. Detect package/Dockerfile changes → rebuild vs reload
3. `rsync` `src/` → `/opt/edutech-nihongo` (keeps certbot/, import/, .env)
4. `scripts/vps-deploy.sh --rebuild| --reload`
5. Health: HTTPS SPA + `/api/public/pricing-plans` + `/api/auth/me` (401)

Manual: Actions → Deploy production → Run workflow (optional force rebuild).

## Local / SSH deploy
```bash
rsync -az --exclude .git --exclude .env ./ vps-exe:/opt/edutech-nihongo/
ssh vps-exe 'cd /opt/edutech-nihongo && ./scripts/vps-deploy.sh --reload'
```
