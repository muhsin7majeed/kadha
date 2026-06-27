import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();

const blockedPathRules = [
  {
    label: 'Client API hooks belong in client/src/features/<feature>/api, not page folders.',
    match: (path) => path.startsWith(`client${sep}src${sep}pages${sep}`) && path.includes(`${sep}apis${sep}`),
  },
  {
    label: 'Server controllers belong in server/src/features/<feature>, not server/src/controllers.',
    match: (path) => path.startsWith(`server${sep}src${sep}controllers${sep}`),
  },
  {
    label: 'Server routes belong in server/src/features/<feature>, not server/src/routes.',
    match: (path) => path.startsWith(`server${sep}src${sep}routes${sep}`),
  },
  {
    label: 'Server schemas belong in server/src/features/<feature>, not server/src/schemas.',
    match: (path) => path.startsWith(`server${sep}src${sep}schemas${sep}`),
  },
];

const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'build']);

function collectFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    if (ignoredDirectories.has(entry)) {
      return [];
    }

    const absolutePath = join(directory, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      return collectFiles(absolutePath);
    }

    return relative(root, absolutePath);
  });
}

const files = collectFiles(root);
const violations = blockedPathRules.flatMap((rule) => {
  return files.filter(rule.match).map((path) => ({ path, label: rule.label }));
});

if (violations.length > 0) {
  console.error('Project structure check failed:\n');

  violations.forEach((violation) => {
    console.error(`- ${violation.path}`);
    console.error(`  ${violation.label}`);
  });

  process.exit(1);
}

console.log('Project structure check passed.');
