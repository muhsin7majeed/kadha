import { describe, expect, it } from 'vitest';

import type { CollectionMember } from '@/features/collections/collections.types';

import { toCollectionMemberRowUser } from './collection-members';

describe('toCollectionMemberRowUser', () => {
  it('flattens collection member metadata onto the row user', () => {
    const member: CollectionMember = {
      createdAt: '2025-01-01T00:00:00.000Z',
      id: 'member-1',
      role: 'editor',
      updatedAt: '2025-01-01T00:00:00.000Z',
      user: {
        id: 'user-1',
        username: 'member',
      },
      userId: 'user-1',
    };

    expect(toCollectionMemberRowUser(member)).toEqual({
      id: 'user-1',
      memberId: 'member-1',
      role: 'editor',
      username: 'member',
    });
  });
});
