# Kadha

![GitHub release](https://img.shields.io/github/v/release/muhsin7majeed/kadha)

An open-source, self-hostable web app for movie and TV tracking.

## License

Kadha is open-source software licensed under the [MIT License](LICENSE). You may use, copy, modify, distribute,
sublicense, or sell copies of the software subject to the license terms.

## Privacy Model

New accounts and collections start private. Users can deliberately share profile sections and collections with
accepted friends or all signed-in users on their Kadha instance. Usernames remain searchable unless blocked, so Kadha
is pseudonymous rather than anonymous.

The hosted service is not end-to-end encrypted. The application server and instance operator can technically access
stored data. The hosted operator does not routinely inspect private content, and Kadha does not sell or rent personal
data, target advertising from it, or train AI models on it. Self-hosting gives the instance operator control of the
server, database, logs, backups, and access policies.

## Architecture

- **Frontend**: Installable React PWA, deployable to GitHub Pages, any static host, or a frontend Docker container
- **Backend**: Node.js + SQLite, deployable with Docker

```
GitHub Pages / Static Host         Your VPS
┌─────────────────────┐           ┌─────────────────────────┐
│  kadha.org          │           │  Caddy (reverse proxy)  │
│  React SPA          │  ──────►  │  api.kadha.org          │
└─────────────────────┘           │    └─► Node.js :5000    │
                                  │        └─► SQLite       │
                                  └─────────────────────────┘
```

## Install As An App

Kadha can be installed directly from a supported browser without an app store:

- **Android and desktop Chromium browsers**: open the browser menu and choose **Install app**, or use
  **Install Kadha** from Kadha's utility menu when the browser offers it.
- **iPhone and iPad**: open the Share menu, choose **Add to Home Screen**, leave **Open as Web App** enabled, and tap
  **Add**. Kadha also shows these instructions from its utility menu.

The installed app caches Kadha's static interface for reliable startup. Account, library, note, activity, and other
authenticated API responses are not stored in the service-worker cache, so a connection is required to load or update
personal content. When a new frontend version is ready, Kadha offers an update action instead of reloading while work
may be in progress.

Production installations require HTTPS. Localhost remains available for development and testing.

## Local Development

### Prerequisites

- Docker and Docker Compose
- Node.js 20.19+ if building outside Docker
- [TMDB API Key](https://www.themoviedb.org/settings/api)

### Setup

Create `.env` in the project root. This is the only env file needed for Docker Compose local development:

```env
DATABASE_URL=file:./db/dev.db
JWT_ACCESS_SECRET=your-random-secret-min-32-chars
JWT_REFRESH_SECRET=another-random-secret-min-32-chars
TMDB_API_KEY=your-tmdb-api-key
TMDB_BEARER_TOKEN=your-tmdb-bearer-token
APP_NAME=Kadha
CLIENT_URL=http://localhost:3000
APP_URL=http://localhost:3000
VITE_APP_NAME=Kadha
VITE_APP_URL=http://localhost:3000
VITE_API_URL=http://localhost:5000
```

Generate secrets:

```bash
openssl rand -base64 32
```

If you run the server directly from `/server` without Docker, create `/server/.env` with the same server variables. Docker Compose reads from the root `.env`.

### Run

```bash
docker compose up --build
```

- App: http://localhost:3000
- API: http://localhost:5000

### Test

Run tests through Docker Compose so the dependency and runtime versions match local development:

```bash
docker compose run --rm server npm test
docker compose run --rm client npm test
```

The server test setup creates a temporary SQLite database for each run and does not touch the development database.

CI runs the same Docker Compose-backed server build/tests and client lint/tests/build on pushes and pull requests to `master`.

## Configuration

### Custom Instance Name

Kadha is the project name, but self-hosted instances can display their own name.

For the frontend, set these before building:

```env
VITE_APP_NAME="Family Watchlist"
VITE_APP_URL=https://watch.example.com
VITE_API_URL=https://api.watch.example.com
```

For the server, set:

```env
APP_NAME="Family Watchlist"
APP_URL=https://watch.example.com
CLIENT_URL=https://watch.example.com
```

Frontend variables prefixed with `VITE_` are build-time values. If you change `VITE_APP_NAME`, `VITE_APP_URL`, or `VITE_API_URL`, rebuild the frontend for the change to appear in the browser.

### App URL And Client URL

`APP_URL` and `CLIENT_URL` often have the same value, but they are intentionally separate:

- `APP_URL` is the public app URL used for generated links and public server output.
- `CLIENT_URL` is the frontend origin allowed by the API for CORS and authenticated cookie requests.

## Account Recovery

Kadha does not require an email address or phone number. Instead, new accounts receive a private recovery code during signup. Users should copy, download, or print the recovery kit and keep it somewhere outside Kadha.

Existing users can create a recovery code from **Settings → Security → Account recovery** after confirming their current password. Replacing a recovery code immediately invalidates the previous one.

Kadha stores only a one-way verifier for the code and cannot reveal it later. If a user loses both their password and recovery code, the account cannot be recovered through the product or support. Instance operators with direct server and database control retain the technical capabilities and responsibilities inherent in self-hosting.

## Manual Builds

Docker Compose is the easiest local development path. Use these commands when you want to build the frontend or server directly.

Build the frontend as a static site:

```bash
cd client
npm ci
VITE_APP_NAME=Kadha \
VITE_APP_URL=http://localhost:3000 \
VITE_API_URL=http://localhost:5000 \
npm run build
```

The static output is written to `client/dist`. Deploy that directory to GitHub Pages, Nginx, Caddy, or another static host.

Build and run the server:

```bash
cd server
npm ci
npm run build
npx prisma migrate deploy --schema=./src/prisma/schema.prisma
npm start
```

Promote an existing user to admin:

```bash
cd server
npm run admin:promote -- --username <username>
```

## Self-Hosting

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

### 2. Backend Deployment

```bash
mkdir -p ~/apps/kadha && cd ~/apps/kadha
```

Create `docker-compose.prod.yml`:

```yaml
services:
  server:
    image: ghcr.io/muhsin7majeed/kadha-server:latest
    volumes:
      - sqlite_data:/app/db
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL:-file:/app/db/prod.db}
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      TMDB_API_KEY: ${TMDB_API_KEY}
      TMDB_BEARER_TOKEN: ${TMDB_BEARER_TOKEN}
      APP_NAME: ${APP_NAME:-Kadha}
      CLIENT_URL: ${CLIENT_URL}
      APP_URL: ${APP_URL:-https://kadha.org}
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
DATABASE_URL=file:/app/db/prod.db
TMDB_API_KEY=your-tmdb-api-key
TMDB_BEARER_TOKEN=your-tmdb-bearer-token
APP_NAME=Kadha
CLIENT_URL=https://kadha.org
APP_URL=https://kadha.org
```

Start the backend:

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 3. Frontend Deployment

The recommended frontend deployment is a static host such as GitHub Pages, Nginx, Caddy, or any static hosting service.
Use HTTPS and deploy the complete `client/dist` directory so `manifest.webmanifest`, `sw.js`, icons, and generated
assets remain together at the frontend origin.

For GitHub Pages, set these GitHub Actions variables:

```env
VITE_API_URL=https://api.kadha.org
```

Optional variables:

```env
VITE_APP_NAME=Kadha
VITE_APP_URL=https://kadha.org
```

If you build the frontend Docker image yourself, pass the same values as build args:

```bash
docker build \
  -f docker/client.prod.Dockerfile \
  --build-arg VITE_APP_NAME=Kadha \
  --build-arg VITE_APP_URL=https://kadha.org \
  --build-arg VITE_API_URL=https://api.kadha.org \
  -t kadha-client:latest .
```

Run that image with:

```bash
docker run -p 8080:80 kadha-client:latest
```

### 4. Reverse Proxy

If the frontend is deployed to GitHub Pages or another static host, Caddy only needs to proxy the API:

```caddy
api.kadha.org {
    reverse_proxy localhost:5000
}
```

If you run the frontend Docker container on the VPS, proxy both domains:

```caddy
kadha.org {
    reverse_proxy localhost:8080
}

api.kadha.org {
    reverse_proxy localhost:5000
}
```

Reload Caddy after editing `/etc/caddy/Caddyfile`:

```bash
sudo systemctl reload caddy
```

Caddy automatically handles SSL via Let's Encrypt.

## Operations

### Database

SQLite database is persisted via Docker volume (`sqlite_data`). The database file lives at `/app/db/prod.db` inside the container.

Back up the database:

```bash
docker compose -f docker-compose.prod.yml cp server:/app/db/prod.db ./backup.db
```

Restore the database:

```bash
docker compose -f docker-compose.prod.yml cp ./backup.db server:/app/db/prod.db
docker compose -f docker-compose.prod.yml restart server
```

Run migrations manually:

```bash
docker compose -f docker-compose.prod.yml exec server npx prisma migrate deploy
```

### Automated Deployments And Rollback

The hosted deployment workflow runs only after CI succeeds for a push to `master`. It checks out the tested commit, publishes the server image with the full commit SHA, and writes that immutable image reference to the production `.env`. The `latest` tag remains available for self-hosted update workflows, but the hosted deployment does not use it.

To roll back the hosted server:

1. Choose the full commit SHA from the previous successful deployment.
2. Set `SERVER_IMAGE=ghcr.io/muhsin7majeed/kadha-server:<commit-sha>` in the production `.env`.
3. Pull and restart that exact image:

```bash
docker compose -f docker-compose.prod.yml pull server
docker compose -f docker-compose.prod.yml up -d server
docker compose -f docker-compose.prod.yml ps
```

Commit-tagged images are retained by the normal deployment cleanup because it removes only dangling images. Rolling back an image does not reverse a database migration, so back up SQLite before migration-bearing releases and review the migration before attempting a code rollback.

### Dependency Audits

Production dependency audits run in CI and weekly. See [`docs/dependency-security.md`](docs/dependency-security.md) for local commands, enforcement behavior, and the current time-bounded advisory exception.

### Admin Setup

Promote an existing user to admin in local Docker Compose:

```bash
docker compose exec server npm run admin:promote -- --username <username>
```

Promote an existing user to admin in production Docker Compose:

```bash
docker compose -f docker-compose.prod.yml exec server npm run admin:promote -- --username <username>
```

### Common Commands

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

## Release Workflow

Keep upcoming changes under `## Unreleased` in `CHANGELOG.md`. When you are ready to release, prepare the version from the repository root:

```bash
node scripts/prepare-release.mjs 0.1.5
```

The script updates the client and server package versions, lockfile root versions, the frontend fallback app version, `CHANGELOG.md`, and the generated in-app changelog. Review the diff, run the relevant Docker Compose build, lint, or test commands, then commit and tag:

```bash
git add CHANGELOG.md client server scripts README.md
git commit -m "Release v0.1.5"
git tag v0.1.5
git push origin master --tags
```

Pushing the tag creates a GitHub Release automatically from the matching `CHANGELOG.md` section.

## CI/CD

The project includes GitHub Actions for automatic deployment:

1. **Frontend** -> GitHub Pages
2. **Backend** -> Docker image pushed to GHCR, deployed to VPS via SSH

See `.github/workflows/` for configuration.

Required GitHub secrets:

- `SERVER_HOST`
- `SERVER_USER`
- `SERVER_SSH_KEY`

Required GitHub variables:

- `VITE_API_URL`

Optional GitHub variables:

- `VITE_APP_NAME`
- `VITE_APP_URL`
