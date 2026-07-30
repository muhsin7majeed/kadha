import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspace = process.argv[2];
const supportedWorkspaces = new Set(['client', 'server']);
const severityRank = {
  info: 0,
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

if (!workspace || !supportedWorkspaces.has(workspace)) {
  throw new Error('Usage: node scripts/audit-production.mjs <client|server>');
}

const exceptionsPath = path.join(repoRoot, 'security', 'npm-audit-exceptions.json');
const exceptionConfig = JSON.parse(readFileSync(exceptionsPath, 'utf8'));
const workspaceExceptions = exceptionConfig.exceptions.filter((exception) => exception.workspace === workspace);
const today = new Date().toISOString().slice(0, 10);

for (const exception of workspaceExceptions) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(exception.expiresOn)) {
    throw new Error(`Audit exception ${exception.advisoryId} has an invalid expiresOn date.`);
  }

  if (exception.expiresOn < today) {
    throw new Error(`Audit exception ${exception.advisoryId} expired on ${exception.expiresOn}.`);
  }
}

const audit = spawnSync('npm', ['audit', '--omit=dev', '--json'], {
  cwd: path.join(repoRoot, workspace),
  encoding: 'utf8',
  shell: false,
});

if (audit.error) {
  throw audit.error;
}

let report;

try {
  report = JSON.parse(audit.stdout);
} catch {
  throw new Error(`Could not parse npm audit output for ${workspace}:\n${audit.stderr || audit.stdout}`);
}

if (report.error || !report.vulnerabilities) {
  throw new Error(`npm audit failed for ${workspace}: ${report.error?.summary || report.message || audit.stderr}`);
}

const advisories = new Map();

const collectAdvisories = (packageName, visitedPackages = new Set()) => {
  if (visitedPackages.has(packageName)) {
    return;
  }

  visitedPackages.add(packageName);
  const vulnerability = report.vulnerabilities[packageName];

  for (const source of vulnerability?.via ?? []) {
    if (typeof source === 'string') {
      collectAdvisories(source, visitedPackages);
      continue;
    }

    advisories.set(String(source.source), {
      id: String(source.source),
      packageName: source.name || packageName,
      severity: source.severity,
      title: source.title,
      url: source.url,
    });
  }
};

for (const packageName of Object.keys(report.vulnerabilities)) {
  collectAdvisories(packageName);
}

const blockingAdvisories = [...advisories.values()].filter(
  (advisory) => severityRank[advisory.severity] >= severityRank.high,
);
const exceptionsById = new Map(
  workspaceExceptions.map((exception) => [String(exception.advisoryId), exception]),
);
const unexpectedAdvisories = blockingAdvisories.filter((advisory) => {
  const exception = exceptionsById.get(advisory.id);
  return !exception || exception.package !== advisory.packageName;
});
const activeAdvisoryIds = new Set(blockingAdvisories.map((advisory) => advisory.id));
const staleExceptions = workspaceExceptions.filter(
  (exception) => !activeAdvisoryIds.has(String(exception.advisoryId)),
);

for (const advisory of blockingAdvisories) {
  const exception = exceptionsById.get(advisory.id);

  if (exception?.package === advisory.packageName) {
    console.log(
      `Allowed ${advisory.severity} advisory ${advisory.id} for ${advisory.packageName} until ${exception.expiresOn}: ${exception.reason}`,
    );
  }
}

if (unexpectedAdvisories.length > 0) {
  console.error(`Unapproved high or critical production advisories found in ${workspace}:`);

  for (const advisory of unexpectedAdvisories) {
    console.error(`- ${advisory.severity.toUpperCase()} ${advisory.packageName}: ${advisory.title} (${advisory.url})`);
  }

  process.exitCode = 1;
} else if (staleExceptions.length > 0) {
  console.error(`Stale production audit exceptions found for ${workspace}:`);

  for (const exception of staleExceptions) {
    console.error(`- ${exception.advisoryId} (${exception.package})`);
  }

  process.exitCode = 1;
} else {
  console.log(`Production dependency audit passed for ${workspace}.`);
}
