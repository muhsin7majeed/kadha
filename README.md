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
AUTH_COOKIE_SAME_SITE=strict
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
- `CLIENT_URL` is the exact trusted frontend origin used for CORS and authentication-request Origin validation.

### Authentication Cookie Security

`AUTH_COOKIE_SAME_SITE` defaults to `strict`. Keep that default when the frontend and API are on the same site; separate
subdomains such as `kadha.org` and `api.kadha.org` are still same-site when both use HTTPS. Authentication requests must
also use JSON, and browser requests from an Origin other than `CLIENT_URL` are rejected.

Set `AUTH_COOKIE_SAME_SITE=none` only when the frontend and API must run on genuinely different sites. This permits the
secure refresh cookie to travel cross-site, while Origin validation still limits authentication requests to
`CLIENT_URL`. `lax` is also accepted for unusual deployments.

### Trusted Reverse Proxy

Authentication rate limits use the request IP address. Set `TRUST_PROXY=1` when exactly one trusted reverse proxy,
such as Caddy or Nginx, sits between the browser and the Kadha server. Leave it unset when clients connect directly to
the server. More complex deployments can use another Express-compatible trust proxy value, but should only trust
known proxy hops or networks so clients cannot spoof forwarding headers.

## Account Recovery

Kadha does not require an email address or phone number. Instead, new accounts receive a private recovery code during signup. Users should copy, download, or print the recovery kit and keep it somewhere outside Kadha.

Existing users can create a recovery code from **Settings → Security → Account recovery** after confirming their current password. Replacing a recovery code immediately invalidates the previous one.

Kadha stores only a one-way verifier for the code and cannot reveal it later. If a user loses both their password and recovery code, the account cannot be recovered through the product or support. Instance operators with direct server and database control retain the technical capabilities and responsibilities inherent in self-hosting.

## Password Changes And Account Deletion

Signed-in users can change their password from **Settings → Security** after confirming their current password. A
successful change revokes every access and refresh session, including the current device.

Users can export their account data and permanently delete their account from **Settings → Data**. Deletion requires
the current password and the exact irreversible-action confirmation phrase shown in the dialog. Before deleting, users
can review the collaboration impact and explicitly transfer shared collections to accepted members. Untransferred
collections are removed, while transferred collections keep their items and remaining memberships under the new owner.
Affected collaborators receive anonymous in-app system notifications. The final administrator account cannot delete
itself until another administrator has been promoted.

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
      AUTH_COOKIE_SAME_SITE: ${AUTH_COOKIE_SAME_SITE:-strict}
      TRUST_PROXY: ${TRUST_PROXY:-1}
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
AUTH_COOKIE_SAME_SITE=strict
TRUST_PROXY=1
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

The production container creates an encrypted, transactionally consistent SQLite backup before every migration run. It
checks the SQLite copy, encrypts it with AES-256-GCM, decrypts and checks it again, and only then continues to migrations.
The latest four successful backups are retained by default in the separate `sqlite_backups` volume.

Create an additional backup manually:

```bash
docker compose -f docker-compose.prod.yml exec server node dist/scripts/database-backup.js backup
```

List and verify backups:

```bash
docker compose -f docker-compose.prod.yml exec server ls -1 /app/backups
docker compose -f docker-compose.prod.yml exec server node dist/scripts/database-backup.js verify /app/backups/<backup-file>
```

Restore a verified backup while the server is stopped:

```bash
docker compose -f docker-compose.prod.yml stop server
docker compose -f docker-compose.prod.yml run --rm --no-deps server node dist/scripts/database-backup.js restore /app/backups/<backup-file>
docker compose -f docker-compose.prod.yml up -d server
```

Restore preserves the replaced database as a timestamped `.pre-restore-*` file. It refuses to proceed if SQLite WAL
files indicate that the server may still be using the database.

An older backup can contain accounts or records deleted after that backup was created. Kadha does not maintain a
deletion ledger outside the database, so before reopening a restored instance, operators must reconcile later account
deletions from an external operational record or other authoritative source. Delete obsolete encrypted backups in
accordance with the instance's disclosed retention policy.

By default, Kadha creates `/app/db/.kadha-backup-key` with owner-only permissions and reuses it for future backups. You
can instead provide `DATABASE_BACKUP_KEY` as a base64-encoded 32-byte secret. Keep an off-host copy of the key and the
encrypted backups in separate secure locations: losing the database volume also loses the default key, and changing
the key makes older backups unreadable. The separate backup volume protects against migration mistakes, but it is not
a substitute for copying encrypted backups off the VPS.

Display the generated key from the application directory on the VPS so it can be saved in a password manager or other
encrypted off-host storage:

```bash
docker compose -f docker-compose.prod.yml exec -T server cat /app/db/.kadha-backup-key
```

Treat the output as a secret: do not commit it, paste it into logs or messages, or store it beside the only off-host
copy of the encrypted backup.

`DATABASE_BACKUP_RETENTION` changes the retained backup count, while `DATABASE_BACKUP_DIRECTORY` and
`DATABASE_BACKUP_KEY_FILE` change their default locations. Count-based retention does not guarantee deletion after a
fixed number of days when backups are created only around migrations; operators that promise a time-based retention
period must schedule backups or separately remove expired backup files.

Run migrations manually only after a successful backup:

```bash
docker compose -f docker-compose.prod.yml exec server node dist/scripts/database-backup.js backup
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
