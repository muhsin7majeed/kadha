import { describe, expect, it } from 'vitest';

import { APP_CONFIG } from '@/config/app-config';
import { buildRecoveryKit, getRecoveryKitFilename } from '@/features/auth/recovery-kit';

describe('recovery kit', () => {
  it('includes the account and instance details needed to identify a saved code', () => {
    const recoveryKit = buildRecoveryKit({
      generatedAt: new Date('2026-07-30T12:00:00.000Z'),
      recoveryCode: 'KADHA-72F9-AC41-8D30-19BE-55C2-A911-04DF',
      username: 'movie-fan',
    });

    expect(recoveryKit).toContain('Kadha Account Recovery Kit');
    expect(recoveryKit).toContain(`Instance: ${APP_CONFIG.appUrl}`);
    expect(recoveryKit).toContain('Username: movie-fan');
    expect(recoveryKit).toContain('Generated: 2026-07-30T12:00:00.000Z');
    expect(recoveryKit).toContain('KADHA-72F9-AC41-8D30-19BE-55C2-A911-04DF');
    expect(recoveryKit).toContain('cannot recover your account');
  });

  it('creates a filesystem-safe download name', () => {
    expect(getRecoveryKitFilename(' movie/fan ')).toBe('movie-fan-kadha-recovery-kit.txt');
    expect(getRecoveryKitFilename('***')).toBe('account-kadha-recovery-kit.txt');
  });
});
