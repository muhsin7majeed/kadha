import fs from 'fs';
import path from 'path';

type PackageJson = {
  version?: string;
};

export function getAppVersion() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as PackageJson;

    return packageJson.version || '0.1.3';
  } catch {
    return '0.1.3';
  }
}
