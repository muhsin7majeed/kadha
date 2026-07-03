import fs from 'fs';
import path from 'path';

type PackageJson = {
  name?: string;
  version?: string;
};

const fallbackVersion = '0.0.0';

function readPackageVersion(packageJsonPath: string) {
  if (!fs.existsSync(packageJsonPath)) {
    return undefined;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as PackageJson;

  return packageJson.name === 'kadha-server' ? packageJson.version : undefined;
}

export function getAppVersion() {
  const packageJsonPaths = [path.resolve(__dirname, '..', '..', 'package.json'), path.join(process.cwd(), 'package.json')];

  for (const packageJsonPath of packageJsonPaths) {
    try {
      const version = readPackageVersion(packageJsonPath);

      if (version) {
        return version;
      }
    } catch {
      continue;
    }
  }

  return fallbackVersion;
}
