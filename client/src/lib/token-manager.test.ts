import { beforeEach, describe, expect, it } from 'vitest';

import { getAccessToken, removeAccessToken, setAccessToken } from './token-manager';

describe('token manager', () => {
  beforeEach(() => {
    removeAccessToken();
  });

  it('stores the current access token in memory', () => {
    setAccessToken('access-token');

    expect(getAccessToken()).toBe('access-token');
  });

  it('removes the current access token', () => {
    setAccessToken('access-token');

    removeAccessToken();

    expect(getAccessToken()).toBeNull();
  });
});
