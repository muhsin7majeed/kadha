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

## Production Deployment (Shared Server)

This setup supports multiple apps on one server using Caddy as reverse proxy.

### 1. Server Setup (One Time)

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

### 2. Deploy the App

```bash
# Clone repo
git clone <repo-url> ~/apps/what-to-watch
cd ~/apps/what-to-watch

# Create .env file
nano .env
```

Add environment variables:

```env
JWT_ACCESS_SECRET=your-production-secret
JWT_REFRESH_SECRET=your-production-secret
TMDB_API_KEY=your-tmdb-api-key
TMDB_BEARER_TOKEN=your-tmdb-bearer-token
CLIENT_URL=https://wtw.muhsi.in
```

Start the app:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 3. Configure Caddy (Reverse Proxy + SSL)

```bash
sudo nano /etc/caddy/Caddyfile
```

```
wtw.muhsi.in {
    reverse_proxy localhost:3080
}

# Your other apps
muhsi.in {
    root * /var/www/muhsi.in
    file_server
}
```

```bash
sudo systemctl reload caddy
```

Caddy automatically gets SSL certificates from Let's Encrypt.

### 4. DNS Setup

Add an A record for your subdomain:

| Type | Name | Value          |
| ---- | ---- | -------------- |
| A    | wtw  | your-server-ip |

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

# Force rebuild (when cached images cause issues)
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# Clean up unused images
docker system prune -a
```

## Backup Database

```bash
# Backup
docker compose -f docker-compose.prod.yml exec mongo mongodump --archive > backup.archive

# Restore
docker compose -f docker-compose.prod.yml exec -T mongo mongorestore --archive < backup.archive
```

## Auto-Deploy with GitHub Actions

Automatically deploy when you push to master.

### Setup

1. Generate SSH key: `ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github-deploy`
2. Add public key to server: `ssh-copy-id -i ~/.ssh/github-deploy.pub user@server`
3. Add secrets to GitHub repo (Settings → Secrets → Actions):
   - `SERVER_HOST` - server IP
   - `SERVER_USER` - SSH username
   - `SERVER_SSH_KEY` - contents of private key file

The workflow file is already included at `.github/workflows/deploy.yml`.

## Adding More Apps

To add another app on the same server:

1. Deploy it on a different port (e.g., `127.0.0.1:3081:80`)
2. Add to Caddyfile:
   ```
   newapp.muhsi.in {
       reverse_proxy localhost:3081
   }
   ```
3. Reload Caddy: `sudo systemctl reload caddy`
