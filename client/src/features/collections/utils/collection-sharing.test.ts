import { describe, expect, it } from 'vitest';

import type { Collection } from '@/features/collections/collections.types';
import { DataPrivacy } from '@/types/common';

import {
  getCollectionAccessLabel,
  getCollectionSharingLabel,
  getSharedMemberCount,
  isCollectionShared,
} from './collection-sharing';

const createCollection = (overrides: Partial<Collection> = {}): Collection => ({
  created_at: new Date('2025-01-01T00:00:00.000Z'),
  description: '',
  id: 'collection-1',
  name: 'Favorites',
  privacy: DataPrivacy.Everyone,
  updated_at: new Date('2025-01-01T00:00:00.000Z'),
  userId: 'user-1',
  ...overrides,
});

describe('collection sharing utilities', () => {
  it('counts shared members without including the owner', () => {
    expect(getSharedMemberCount(createCollection({ memberCount: 1 }))).toBe(0);
    expect(getSharedMemberCount(createCollection({ memberCount: 3 }))).toBe(2);
    expect(getSharedMemberCount(createCollection({ memberCount: 0 }))).toBe(0);
  });

  it('detects collections shared by membership or member count', () => {
    expect(isCollectionShared(createCollection())).toBe(false);
    expect(isCollectionShared(createCollection({ memberCount: 2 }))).toBe(true);
    expect(
      isCollectionShared(
        createCollection({
          access: {
            canEditItems: false,
            canManageSharing: false,
            canView: true,
            relationship: 'member',
            role: 'viewer',
          },
        }),
      ),
    ).toBe(true);
  });

  it('labels member access levels', () => {
    expect(
      getCollectionAccessLabel(
        createCollection({
          access: {
            canEditItems: true,
            canManageSharing: false,
            canView: true,
            relationship: 'member',
            role: 'editor',
          },
        }),
      ),
    ).toBe('You can edit');

    expect(getCollectionAccessLabel(createCollection())).toBeNull();
  });

  it('labels owner and member sharing states', () => {
    expect(getCollectionSharingLabel(createCollection({ memberCount: 2 }))).toBe('Shared with 1 person');
    expect(getCollectionSharingLabel(createCollection({ memberCount: 4 }))).toBe('Shared with 3 people');
    expect(
      getCollectionSharingLabel(
        createCollection({
          access: {
            canEditItems: false,
            canManageSharing: false,
            canView: true,
            relationship: 'member',
            role: 'viewer',
          },
          owner: {
            id: 'owner-1',
            username: 'owner',
          },
        }),
      ),
    ).toBe('Created by owner');
    expect(getCollectionSharingLabel(createCollection())).toBeNull();
  });
});
