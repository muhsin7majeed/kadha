import { describe, expect, it } from 'vitest';

import { isIosDevice, isStandalonePwa } from './pwa-install.types';

describe('PWA install environment detection', () => {
  it('detects iPhone and touch-enabled iPad desktop user agents', () => {
    expect(
      isIosDevice({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
        platform: 'iPhone',
        maxTouchPoints: 5,
      }),
    ).toBe(true);

    expect(
      isIosDevice({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      }),
    ).toBe(true);
  });

  it('does not treat a non-touch Mac as iOS', () => {
    expect(
      isIosDevice({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',
        platform: 'MacIntel',
        maxTouchPoints: 0,
      }),
    ).toBe(false);
  });

  it('recognizes standards-based and iOS standalone display modes', () => {
    expect(isStandalonePwa(true, false)).toBe(true);
    expect(isStandalonePwa(false, true)).toBe(true);
    expect(isStandalonePwa(false, false)).toBe(false);
  });
});
