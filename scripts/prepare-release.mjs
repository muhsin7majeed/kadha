import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = process.argv[2];

const paths = {
  changelog: path.join(repoRoot, 'CHANGELOG.md'),
  clientPackage: path.join(repoRoot, 'client', 'package.json'),
  clientLock: path.join(repoRoot, 'client', 'package-lock.json'),
  serverPackage: path.join(repoRoot, 'server', 'package.json'),
  serverLock: path.join(repoRoot, 'server', 'package-lock.json'),
  appConfig: path.join(repoRoot, 'client', 'src', 'config', 'app-config.ts'),
};

const usage = 'Usage: node scripts/prepare-release.mjs <version>, for example: node scripts/prepare-release.mjs 0.1.5';

if (!version) {
  throw new Error(usage);
}

if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
  throw new Error(`Invalid version "${version}". Use SemVer without a leading "v".\n${usage}`);
}

const readJson = (filePath) => JSON.parse(readFileSync(filePath, 'utf8'));

const writeJson = (filePath, value) => {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
};

const setPackageVersion = (filePath) => {
  const packageJson = readJson(filePath);
  packageJson.version = version;
  writeJson(filePath, packageJson);
};

const setPackageLockVersion = (filePath) => {
  const lockfile = readJson(filePath);
  lockfile.version = version;

  if (lockfile.packages?.['']) {
    lockfile.packages[''].version = version;
  }

  writeJson(filePath, lockfile);
};

const updateAppConfigVersion = () => {
  const source = readFileSync(paths.appConfig, 'utf8');
  const updated = source.replace(
    /version:\s*import\.meta\.env\.VITE_APP_VERSION\s*\|\|\s*'[^']+'/,
    `version: import.meta.env.VITE_APP_VERSION || '${version}'`,
  );

  if (source === updated) {
    throw new Error(`Could not find APP_CONFIG.version fallback in ${path.relative(repoRoot, paths.appConfig)}`);
  }

  writeFileSync(paths.appConfig, updated);
};

const updateChangelog = () => {
  const source = readFileSync(paths.changelog, 'utf8');
  const unreleasedHeading = '## Unreleased';

  if (!source.includes(unreleasedHeading)) {
    throw new Error('CHANGELOG.md does not contain a "## Unreleased" section.');
  }

  if (source.includes(`## v${version}`)) {
    throw new Error(`CHANGELOG.md already contains a "## v${version}" section.`);
  }

  const updated = source.replace(unreleasedHeading, `${unreleasedHeading}\n\n## v${version}`);

  if (source === updated) {
    throw new Error('Could not update CHANGELOG.md.');
  }

  writeFileSync(paths.changelog, updated);
};

const syncChangelog = () => {
  const result = spawnSync('npm', ['run', 'sync:changelog'], {
    cwd: path.join(repoRoot, 'client'),
    stdio: 'inherit',
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error('Failed to sync the client changelog.');
  }
};

for (const filePath of Object.values(paths)) {
  if (!existsSync(filePath)) {
    throw new Error(`Expected file not found: ${path.relative(repoRoot, filePath)}`);
  }
}

setPackageVersion(paths.clientPackage);
setPackageLockVersion(paths.clientLock);
setPackageVersion(paths.serverPackage);
setPackageLockVersion(paths.serverLock);
updateAppConfigVersion();
updateChangelog();
syncChangelog();

console.log(`Prepared Kadha v${version}. Review the diff, then commit and tag the release.`);
