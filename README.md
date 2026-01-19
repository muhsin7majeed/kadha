# What to Watch

A self-hostable web app to track movies and TV shows.

## Architecture

- **Frontend**: React SPA (GitHub Pages or self-hosted)
- **Backend**: Node.js + SQLite (Docker)

```
GitHub Pages / Static Host         Your VPS
┌─────────────────────┐           ┌─────────────────────────┐
│  your-domain.com    │           │  Caddy (reverse proxy)  │
│  React SPA          │  ──────►  │  api.your-domain.com    │
└─────────────────────┘           │    └─► Node.js :5000    │
                                  │        └─► SQLite       │
                                  └─────────────────────────┘
```

## Local Development

### Prerequisites

- Docker and Docker Compose
- [TMDB API Key](https://www.themoviedb.org/settings/api)

### Setup

Create `.env` in project root:

```env
DATABASE_URL=file:./db/dev.db
JWT_ACCESS_SECRET=your-random-secret-min-32-chars
JWT_REFRESH_SECRET=another-random-secret-min-32-chars
TMDB_API_KEY=your-tmdb-api-key
TMDB_BEARER_TOKEN=your-tmdb-bearer-token
CLIENT_URL=http://localhost:3000
```

Generate secrets: `openssl rand -base64 32`

### Run

```bash
docker compose up --build
```

- App: http://localhost:3000
- API: http://localhost:5000

---

## Self-Hosting (Production)

### 1. Server Setup

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Caddy (optional, for SSL/reverse proxy)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

### 2. Deploy

```bash
mkdir -p ~/apps/what-to-watch && cd ~/apps/what-to-watch
```

Create `docker-compose.prod.yml`:

```yaml
services:
  server:
    image: ghcr.io/muhsin7majeed/what-to-watch-server:latest
    volumes:
      - sqlite_data:/app/db
    environment:
      NODE_ENV: production
      DATABASE_URL: file:/app/db/prod.db
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      TMDB_API_KEY: ${TMDB_API_KEY}
      TMDB_BEARER_TOKEN: ${TMDB_BEARER_TOKEN}
      CLIENT_URL: ${CLIENT_URL}
    ports:
      - '127.0.0.1:5000:5000'
    restart: unless-stopped

volumes:
  sqlite_data:
```

Create `.env`:

```env
JWT_ACCESS_SECRET=your-production-secret
JWT_REFRESH_SECRET=your-production-secret
TMDB_API_KEY=your-tmdb-api-key
TMDB_BEARER_TOKEN=your-tmdb-bearer-token
CLIENT_URL=https://your-domain.com
```

Start:

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 3. Reverse Proxy (Caddy)

```bash
sudo nano /etc/caddy/Caddyfile
```

```
api.your-domain.com {
    reverse_proxy localhost:5000
}
```

```bash
sudo systemctl reload caddy
```

Caddy automatically handles SSL via Let's Encrypt.

---

## Database

SQLite database is persisted via Docker volume (`sqlite_data`). The database file lives at `/app/db/prod.db` inside the container.

### Backup

```bash
# Copy database from volume
docker compose -f docker-compose.prod.yml cp server:/app/db/prod.db ./backup.db

# Restore
docker compose -f docker-compose.prod.yml cp ./backup.db server:/app/db/prod.db
docker compose -f docker-compose.prod.yml restart server
```

### Run Migrations

Migrations run automatically on container start. To run manually:

```bash
docker compose -f docker-compose.prod.yml exec server npx prisma migrate deploy
```

---

## Common Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f server

# Restart
docker compose -f docker-compose.prod.yml restart

# Update to latest image
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Clean up old images
docker image prune -f
```

---

## CI/CD (Optional)

The project includes GitHub Actions for automatic deployment:

1. **Frontend** → GitHub Pages
2. **Backend** → Docker image pushed to GHCR, deployed to VPS via SSH

See `.github/workflows/` for configuration. Required secrets:

- `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY` for VPS deployment
- `VITE_API_URL` variable for frontend build
