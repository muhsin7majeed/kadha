import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.resolve(scriptDir, '..');
const outputPath = path.join(clientDir, 'src', 'generated', 'changelog.ts');

const sourceCandidates = [
  process.env.KADHA_CHANGELOG_PATH,
  path.resolve(clientDir, '..', 'CHANGELOG.md'),
  path.resolve(clientDir, 'CHANGELOG.md'),
].filter(Boolean);

const sourcePath = sourceCandidates.find((candidate) => existsSync(candidate));

if (!sourcePath) {
  if (existsSync(outputPath)) {
    console.warn('CHANGELOG.md was not found; using existing generated changelog.');
    process.exit(0);
  }

  throw new Error('CHANGELOG.md was not found and no generated changelog exists.');
}

const changelog = readFileSync(sourcePath, 'utf8');
const generatedContent = [
  'export const changelogMarkdown = ',
  JSON.stringify(changelog),
  ';\n',
].join('');

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, generatedContent);

console.log(`Generated ${path.relative(clientDir, outputPath)} from ${sourcePath}`);
