import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const RECOVERY_CODE_PREFIX = 'KADHA';
const RECOVERY_CODE_SECRET_LENGTH = 32;
const RECOVERY_CODE_GROUP_LENGTH = 4;
const RECOVERY_CODE_PATTERN = /^[A-F0-9]{32}$/;

export const generateRecoveryCode = () => {
  const secret = randomBytes(16).toString('hex').toUpperCase();
  const groups = secret.match(new RegExp(`.{1,${RECOVERY_CODE_GROUP_LENGTH}}`, 'g'));

  if (!groups) {
    throw new Error('Unable to format recovery code');
  }

  return `${RECOVERY_CODE_PREFIX}-${groups.join('-')}`;
};

export const normalizeRecoveryCode = (value: string) => {
  const compactValue = value.toUpperCase().replace(/[\s-]/g, '');
  const secret = compactValue.startsWith(RECOVERY_CODE_PREFIX)
    ? compactValue.slice(RECOVERY_CODE_PREFIX.length)
    : compactValue;

  if (secret.length !== RECOVERY_CODE_SECRET_LENGTH || !RECOVERY_CODE_PATTERN.test(secret)) {
    return null;
  }

  return secret;
};

export const hashRecoveryCode = (normalizedCode: string) => {
  return createHash('sha256').update(normalizedCode, 'utf8').digest('hex');
};

export const createRecoveryCode = () => {
  const recoveryCode = generateRecoveryCode();
  const normalizedCode = normalizeRecoveryCode(recoveryCode);

  if (!normalizedCode) {
    throw new Error('Generated an invalid recovery code');
  }

  return {
    recoveryCode,
    recoveryCodeHash: hashRecoveryCode(normalizedCode),
  };
};

export const verifyRecoveryCode = (candidate: string, expectedHash: string) => {
  const normalizedCode = normalizeRecoveryCode(candidate);

  if (!normalizedCode) {
    return false;
  }

  const candidateHash = Buffer.from(hashRecoveryCode(normalizedCode), 'hex');
  const storedHash = Buffer.from(expectedHash, 'hex');

  return candidateHash.length === storedHash.length && timingSafeEqual(candidateHash, storedHash);
};
