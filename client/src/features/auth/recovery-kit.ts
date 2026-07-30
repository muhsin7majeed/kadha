import { APP_CONFIG } from '@/config/app-config';

interface RecoveryKitDetails {
  generatedAt: Date;
  recoveryCode: string;
  username: string;
}

export const buildRecoveryKit = ({ generatedAt, recoveryCode, username }: RecoveryKitDetails) => {
  return `${APP_CONFIG.appName} Account Recovery Kit

Instance: ${APP_CONFIG.appUrl}
Username: ${username}
Generated: ${generatedAt.toISOString()}

Recovery code:
${recoveryCode}

Keep this code private. Anyone with your username and this code can reset
your password and take control of your account.

${APP_CONFIG.appName} cannot recover your account if you lose both your password
and this recovery code.
`;
};

export const getRecoveryKitFilename = (username: string) => {
  const safeUsername = username.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return `${safeUsername || 'account'}-kadha-recovery-kit.txt`;
};
