# What to Watch

A web app to track movies and TV shows you want to watch.

## Architecture

- **Frontend**: React SPA deployed to GitHub Pages
- **Backend**: Node.js API + MongoDB deployed via Docker on VPS
- **CI/CD**: GitHub Actions automatically deploys on push to master

```
GitHub Pages (free)              Your VPS
┌─────────────────────┐          ┌─────────────────────────┐
│  your-domain.com    │          │  Caddy (reverse proxy)  │
│  React SPA (static) │  ──────► │  api.your-domain.com    │
│  Built by GH Action │          │    └─► Node.js :5000    │
└─────────────────────┘          │    └─► MongoDB          │
                                 └─────────────────────────┘
```

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

---

## Production Deployment

### Overview

This setup deploys:

- **React client** → GitHub Pages (free hosting, global CDN)
- **Node.js server + MongoDB** → Your VPS via Docker

Benefits:

- No builds on VPS (saves RAM/CPU)
- Automatic deployments via GitHub Actions
- Free frontend hosting with GitHub Pages
- Server only needs ~300-400MB RAM

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

### 2. Create App Directory on VPS

```bash
mkdir -p ~/apps/what-to-watch
cd ~/apps/what-to-watch
```

Create `docker-compose.prod.yml`:

```yaml
services:
  server:
    image: ${SERVER_IMAGE:-ghcr.io/YOUR_USERNAME/YOUR_REPO-server:latest}
    environment:
      NODE_ENV: production
      MONGO_URI: mongodb://mongo:27017/what-to-watch
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      TMDB_API_KEY: ${TMDB_API_KEY}
      TMDB_BEARER_TOKEN: ${TMDB_BEARER_TOKEN}
      CLIENT_URL: ${CLIENT_URL}
    ports:
      - '127.0.0.1:5000:5000'
    restart: unless-stopped
    healthcheck:
      test:
        [
          'CMD',
          'node',
          '-e',
          "fetch('http://localhost:5000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    depends_on:
      mongo:
        condition: service_healthy

  mongo:
    image: mongo:7
    restart: unless-stopped
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ['CMD', 'mongosh', '--eval', "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s

volumes:
  mongo_data:
```

Create `.env` file:

```env
SERVER_IMAGE=ghcr.io/YOUR_USERNAME/YOUR_REPO-server:latest
JWT_ACCESS_SECRET=your-production-secret
JWT_REFRESH_SECRET=your-production-secret
TMDB_API_KEY=your-tmdb-api-key
TMDB_BEARER_TOKEN=your-tmdb-bearer-token
CLIENT_URL=https://wtw.your-domain.com
```

Note: `SERVER_IMAGE` will be automatically updated by the CI/CD pipeline on each deployment.

### 3. Configure Caddy (Reverse Proxy + SSL)

```bash
sudo nano /etc/caddy/Caddyfile
```

```
# API server (proxies to Docker container)
api.wtw.your-domain.com {
    reverse_proxy localhost:5000
}

# Other apps on the same server
your-domain.com {
    root * /var/www/your-domain.com
    file_server
}
```

```bash
sudo systemctl reload caddy
```

Caddy automatically gets SSL certificates from Let's Encrypt.

### 4. DNS Setup

Add A records for your domains:

| Type | Name    | Value          |
| ---- | ------- | -------------- |
| A    | wtw     | your-server-ip |
| A    | api.wtw | your-server-ip |

For GitHub Pages with custom domain, also add:

| Type  | Name | Value                   |
| ----- | ---- | ----------------------- |
| CNAME | wtw  | YOUR_USERNAME.github.io |

### 5. GitHub Repository Setup

#### Enable GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Source: **GitHub Actions**

#### Add Repository Variables

Go to **Settings** → **Secrets and variables** → **Actions** → **Variables** tab:

| Variable     | Value                           |
| ------------ | ------------------------------- |
| VITE_API_URL | https://api.wtw.your-domain.com |

#### Add Repository Secrets

Go to **Settings** → **Secrets and variables** → **Actions** → **Secrets** tab:

| Secret         | Value                                  |
| -------------- | -------------------------------------- |
| SERVER_HOST    | Your VPS IP address                    |
| SERVER_USER    | SSH username (e.g., root or your user) |
| SERVER_SSH_KEY | Private SSH key (see below)            |

#### Generate Deploy SSH Key

On your local machine:

```bash
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github-deploy -N ""
```

Add public key to your VPS:

```bash
ssh-copy-id -i ~/.ssh/github-deploy.pub user@your-server-ip
```

Copy the private key content for `SERVER_SSH_KEY` secret:

```bash
cat ~/.ssh/github-deploy
```

#### Make GHCR Package Public (Optional)

After first deployment, go to your GitHub profile → **Packages** → select the package → **Package settings** → **Change visibility** → **Public**

This allows your VPS to pull images without authentication.

### 6. First Deployment

Push to master branch to trigger the deployment:

```bash
git add .
git commit -m "Setup CI/CD"
git push origin master
```

Or manually trigger: **Actions** → **Deploy** → **Run workflow**

### 7. GitHub Pages Custom Domain (Optional)

1. Go to **Settings** → **Pages**
2. Enter your custom domain (e.g., `wtw.your-domain.com`)
3. Check "Enforce HTTPS"

---

## Common Commands

### On VPS

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# View server logs only
docker compose -f docker-compose.prod.yml logs -f server

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop services
docker compose -f docker-compose.prod.yml down

# Pull latest image and restart
docker pull ghcr.io/YOUR_USERNAME/YOUR_REPO-server:latest
docker compose -f docker-compose.prod.yml up -d

# Clean up old images
docker image prune -f
```

### Backup Database

```bash
# Backup
docker compose -f docker-compose.prod.yml exec mongo mongodump --archive > backup.archive

# Restore
docker compose -f docker-compose.prod.yml exec -T mongo mongorestore --archive < backup.archive
```

---

## Adding More Apps to the Same Server

1. Create new app directory: `mkdir ~/apps/new-app`
2. Add docker-compose.prod.yml with different port
3. Add to Caddyfile:
   ```
   newapp.your-domain.com {
       reverse_proxy localhost:3001
   }
   ```
4. Reload Caddy: `sudo systemctl reload caddy`

---

## Troubleshooting

### GitHub Actions fails to SSH

- Verify `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY` secrets are correct
- Ensure the public key is in `~/.ssh/authorized_keys` on VPS
- Check VPS firewall allows SSH (port 22)

### CORS errors in browser

- Verify `CLIENT_URL` in VPS `.env` matches your GitHub Pages URL exactly
- Check the API URL in browser matches `VITE_API_URL`

### Docker pull fails on VPS

- Make sure the package is public, OR
- Add a GitHub Personal Access Token to VPS for authentication

### 404 on page refresh (GitHub Pages)

The workflow creates a `404.html` that handles SPA routing. If issues persist, ensure the build completed successfully.
