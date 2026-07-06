import { beforeEach, describe, expect, it } from 'vitest';

import type { User } from '@/features/user/user.types';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';
import { getAccessToken, removeAccessToken, setAccessToken } from '@/lib/token-manager';
import { DataPrivacy, UserRole } from '@/types/common';

import { clearSession } from './session';

const user: User = {
  id: 'user-1',
  username: 'member',
  role: UserRole.User,
  profilePrivacy: DataPrivacy.Everyone,
  watchedPrivacy: DataPrivacy.Everyone,
  likedPrivacy: DataPrivacy.Everyone,
  watchlistPrivacy: DataPrivacy.Everyone,
  watchRegion: 'US',
};

describe('clearSession', () => {
  beforeEach(() => {
    queryClient.clear();
    removeAccessToken();
  });

  it('removes auth state while preserving the me query as unauthenticated', async () => {
    setAccessToken('access-token');
    queryClient.setQueryData(queryKeys.me, user);
    queryClient.setQueryData(queryKeys.notificationsPage(1), { data: [] });
    queryClient.setQueryData(queryKeys.userProfile('member'), { data: user });

    await clearSession();

    expect(getAccessToken()).toBeNull();
    expect(queryClient.getQueryData(queryKeys.me)).toBeNull();
    expect(queryClient.getQueryData(queryKeys.notificationsPage(1))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.userProfile('member'))).toBeUndefined();
  });
});
