import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { formatUpcomingRelativeDate } from './upcoming-date';

const originalTimeZone = process.env.TZ;

describe('formatUpcomingRelativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    process.env.TZ = 'America/Los_Angeles';
    vi.setSystemTime(new Date('2026-09-21T00:30:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    if (originalTimeZone === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = originalTimeZone;
    }
  });

  it('uses UTC calendar boundaries for relative upcoming labels', () => {
    expect(formatUpcomingRelativeDate('2026-09-21')).toBe('Today');
    expect(formatUpcomingRelativeDate('2026-09-22')).toBe('Tomorrow');
    expect(formatUpcomingRelativeDate('2026-09-24')).toBe('In 3 days');
  });
});
