import { describe, expect, it } from 'vitest';

import { estimatePasswordStrength } from './password-strength';

describe('estimatePasswordStrength', () => {
  it('scores a long uncommon password above a common password', async () => {
    const weakResult = await estimatePasswordStrength('password', 'movie-fan');
    const strongResult = await estimatePasswordStrength('orchid-lantern-harbor-8472!', 'movie-fan');

    expect(strongResult.score).toBeGreaterThan(weakResult.score);
  });
});
