import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const composeFile = join(repositoryRoot, 'deploy/hosted/compose.yaml');
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'kadha-hosted-compose-'));
const environmentFile = join(temporaryDirectory, '.env');

const environment = `SERVER_IMAGE=ghcr.io/example/kadha-server:contract-test
DATABASE_URL=file:/app/db/prod.db
DATABASE_BACKUP_DIRECTORY=/app/backups
DATABASE_BACKUP_KEY=
DATABASE_BACKUP_KEY_FILE=/app/db/.kadha-backup-key
DATABASE_BACKUP_RETENTION=4
JWT_ACCESS_SECRET=contract-test-access-secret
JWT_REFRESH_SECRET=contract-test-refresh-secret
TMDB_API_KEY=contract-test-tmdb-api-key
TMDB_BEARER_TOKEN=contract-test-tmdb-bearer-token
CLIENT_URL=https://kadha.org
`;

const fail = (message) => {
  throw new Error(`Hosted Compose contract failed: ${message}`);
};

const assert = (condition, message) => {
  if (!condition) fail(message);
};

try {
  writeFileSync(environmentFile, environment);

  const rendered = execFileSync(
    'docker',
    [
      'compose',
      '--project-name',
      'kadha',
      '--project-directory',
      repositoryRoot,
      '--env-file',
      environmentFile,
      '--file',
      composeFile,
      'config',
      '--format',
      'json',
    ],
    { encoding: 'utf8' },
  );
  const config = JSON.parse(rendered);
  const serviceNames = Object.keys(config.services ?? {});
  const volumeNames = Object.keys(config.volumes ?? {});
  const server = config.services?.server;

  assert(serviceNames.length === 1 && serviceNames[0] === 'server', 'the hosted stack must contain only the server service');
  assert(server, 'the hosted stack must define a server service');
  assert(server.image === 'ghcr.io/example/kadha-server:contract-test', 'SERVER_IMAGE must be passed through unchanged');
  assert(server.restart === 'unless-stopped', 'the server restart policy must remain unless-stopped');
  assert(
    server.ports?.some(
      (port) =>
        port.host_ip === '127.0.0.1' &&
        Number(port.published) === 5000 &&
        Number(port.target) === 5000 &&
        port.protocol === 'tcp',
    ),
    'the server must publish only 127.0.0.1:5000 to container port 5000',
  );

  const mounts = server.volumes ?? [];
  assert(
    mounts.some((mount) => mount.type === 'volume' && mount.source === 'sqlite_data' && mount.target === '/app/db'),
    'the existing database volume must remain sqlite_data mounted at /app/db',
  );
  assert(
    mounts.some(
      (mount) => mount.type === 'volume' && mount.source === 'sqlite_backups' && mount.target === '/app/backups',
    ),
    'the existing backup volume must remain sqlite_backups mounted at /app/backups',
  );
  assert(
    volumeNames.length === 2 && volumeNames.includes('sqlite_data') && volumeNames.includes('sqlite_backups'),
    'the hosted stack must declare only the database and backup volumes',
  );
  assert(config.volumes.sqlite_data?.name === 'kadha_sqlite_data', 'database volume identity must be explicit');
  assert(config.volumes.sqlite_backups?.name === 'kadha_sqlite_backups', 'backup volume identity must be explicit');

  const expectedEnvironment = {
    NODE_ENV: 'production',
    DATABASE_URL: 'file:/app/db/prod.db',
    DATABASE_BACKUP_DIRECTORY: '/app/backups',
    DATABASE_BACKUP_KEY_FILE: '/app/db/.kadha-backup-key',
    DATABASE_BACKUP_RETENTION: '4',
    APP_NAME: 'Kadha',
    CLIENT_URL: 'https://kadha.org',
    APP_URL: 'https://kadha.org',
    AUTH_COOKIE_SAME_SITE: 'strict',
    TRUST_PROXY: '1',
  };
  for (const [key, value] of Object.entries(expectedEnvironment)) {
    assert(server.environment?.[key] === value, `${key} must render as ${value}`);
  }

  const healthcheck = server.healthcheck;
  assert(healthcheck?.test?.[0] === 'CMD', 'the health check must execute a command');
  assert(healthcheck.test?.[1] === 'node' && healthcheck.test?.[3]?.includes('/health'), 'the health check must call /health');
  assert(healthcheck.interval === '30s', 'the health check interval must remain 30s');
  assert(healthcheck.timeout === '10s', 'the health check timeout must remain 10s');
  assert(Number(healthcheck.retries) === 3, 'the health check retries must remain 3');
  assert(healthcheck.start_period === '40s', 'the health check start period must remain 40s');

  console.log('Hosted Compose contract passed.');
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
