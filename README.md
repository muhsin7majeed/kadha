# What to Watch

A web app to track movies and TV shows you want to watch.

## Prerequisites

- Docker and Docker Compose
- [TMDB API Key](https://www.themoviedb.org/settings/api)

## Environment Variables

Create a `.env` file in the project root:

```env
JWT_ACCESS_SECRET=your-random-secret-min-32-chars
JWT_REFRESH_SECRET=another-random-secret-min-32-chars
TMDB_API_KEY=your-tmdb-api-key
TMDB_BEARER_TOKEN=your-tmdb-bearer-token
CLIENT_URL=http://localhost:3000
```

Generate secrets with: `openssl rand -base64 32`

## Local Development

```bash
docker compose up --build
```

- App: http://localhost:3000
- API: http://localhost:5000

## Production Deployment

### 1. Server Setup

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 2. Deploy

```bash
# Clone repo
git clone <repo-url>
cd what-to-watch-web

# Create .env file
nano .env
```

Add production environment variables:

```env
JWT_ACCESS_SECRET=your-production-secret
JWT_REFRESH_SECRET=your-production-secret
TMDB_API_KEY=your-tmdb-api-key
TMDB_BEARER_TOKEN=your-tmdb-bearer-token
CLIENT_URL=https://yourdomain.com
```

### 3. Run

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

App will be available on port 80.

### 4. HTTPS (Recommended)

Use a reverse proxy like Caddy for automatic SSL:

```bash
# Install Caddy
sudo apt install caddy

# Configure
sudo nano /etc/caddy/Caddyfile
```

```
yourdomain.com {
    reverse_proxy localhost:80
}
```

```bash
sudo systemctl restart caddy
```

## Common Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart
docker compose -f docker-compose.prod.yml restart

# Stop
docker compose -f docker-compose.prod.yml down

# Update
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Backup Database

```bash
# Backup
docker compose -f docker-compose.prod.yml exec mongo mongodump --archive > backup.archive

# Restore
docker compose -f docker-compose.prod.yml exec -T mongo mongorestore --archive < backup.archive
```
