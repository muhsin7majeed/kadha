import { describe, expect, it } from 'vitest';

import { reserveLetterboxdWork } from '@/features/user/letterboxd-import.rate-limit';

describe('Letterboxd work budget', () => {
  it('allows a 5,000-film preview and import plus a retry, but bounds further work per user', () => {
    const userId = 'letterboxd-work-budget';
    for (let index = 0; index < 150; index += 1) {
      const lease = reserveLetterboxdWork(userId, 100);
      expect(lease).toHaveProperty('release');
      if ('release' in lease) lease.release();
    }
    expect(reserveLetterboxdWork(userId, 1)).toHaveProperty('retryAfter');
    const another = reserveLetterboxdWork('other-letterboxd-user', 1);
    expect(another).toHaveProperty('release');
    if ('release' in another) another.release();
  });

  it('bounds concurrent provider-intensive requests and releases slots after failure', () => {
    const userId = 'letterboxd-concurrency';
    const lease = reserveLetterboxdWork(userId, 1);
    expect(lease).toHaveProperty('release');
    expect(reserveLetterboxdWork(userId, 1)).toHaveProperty('retryAfter');
    if ('release' in lease) lease.release();
    const next = reserveLetterboxdWork(userId, 1);
    expect(next).toHaveProperty('release');
    if ('release' in next) next.release();

    const slots = Array.from({ length: 4 }, (_, index) => reserveLetterboxdWork(`letterboxd-global-${index}`, 1));
    expect(slots.every((slot) => 'release' in slot)).toBe(true);
    expect(reserveLetterboxdWork('letterboxd-global-overflow', 1)).toHaveProperty('retryAfter');
    for (const slot of slots) if ('release' in slot) slot.release();
    const after = reserveLetterboxdWork('letterboxd-global-overflow', 1);
    expect(after).toHaveProperty('release');
    if ('release' in after) after.release();

    const writer = reserveLetterboxdWork('letterboxd-writer-one', 100, true);
    expect(writer).toHaveProperty('release');
    expect(reserveLetterboxdWork('letterboxd-writer-two', 100, true)).toHaveProperty('retryAfter');
    if ('release' in writer) writer.release();
    const secondWriter = reserveLetterboxdWork('letterboxd-writer-two', 100, true);
    expect(secondWriter).toHaveProperty('release');
    if ('release' in secondWriter) secondWriter.release();
  });
});
