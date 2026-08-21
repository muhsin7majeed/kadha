import { describe, expect, it } from 'vitest';

import { DeletionImpact } from './account-deletion.types';
import { keepValidOwnershipOverrides, resolveDeletionPlan, toOwnershipPlan } from './account-deletion-plan';

const impact: DeletionImpact = {
  impactFingerprint: 'fingerprint',
  isFinalAdministrator: false,
  ownedCollectionCount: 4,
  unsharedOwnedCollectionCount: 1,
  membershipsToLeaveCount: 2,
  sharedOwnedCollections: [
    {
      id: 'collection-1',
      name: 'One',
      itemCount: 3,
      automaticRecipientUserId: 'member-1',
      members: [
        { memberId: 'row-1', userId: 'member-1', username: 'one', role: 'viewer', joinedAt: '2026-01-01' },
        { memberId: 'row-2', userId: 'member-2', username: 'two', role: 'editor', joinedAt: '2026-01-02' },
      ],
    },
    {
      id: 'collection-2',
      name: 'Two',
      itemCount: 4,
      automaticRecipientUserId: 'member-2',
      members: [{ memberId: 'row-3', userId: 'member-2', username: 'two', role: 'editor', joinedAt: '2026-01-01' }],
    },
    {
      id: 'collection-3',
      name: 'Three',
      itemCount: 5,
      automaticRecipientUserId: 'member-3',
      members: [{ memberId: 'row-4', userId: 'member-3', username: 'three', role: 'viewer', joinedAt: '2026-01-01' }],
    },
  ],
};

describe('account deletion plan', () => {
  it('keeps automatic transfer opt-in and resolves explicit choices over the checkbox', () => {
    expect(resolveDeletionPlan(impact, false, {})).toMatchObject({
      transferredCollectionCount: 0,
      deletedCollectionCount: 4,
      collaboratorsLosingAccessCount: 3,
    });

    const resolved = resolveDeletionPlan(impact, true, {
      'collection-1': { collectionId: 'collection-1', action: 'delete' },
      'collection-2': { collectionId: 'collection-2', action: 'transfer', newOwnerUserId: 'member-2' },
    });

    expect(resolved).toMatchObject({
      transferredCollectionCount: 2,
      deletedCollectionCount: 2,
      collaboratorsLosingAccessCount: 2,
    });
    expect(resolved.outcomes.find((outcome) => outcome.collectionId === 'collection-1')).toMatchObject({
      action: 'delete',
      isOverride: true,
    });
  });

  it('serializes only explicit choices and drops choices that became invalid', () => {
    const overrides = {
      'collection-1': { collectionId: 'collection-1', action: 'transfer', newOwnerUserId: 'member-2' } as const,
      'collection-2': { collectionId: 'collection-2', action: 'delete' } as const,
      missing: { collectionId: 'missing', action: 'delete' } as const,
    };

    expect(toOwnershipPlan(true, overrides).overrides).toHaveLength(3);
    expect(keepValidOwnershipOverrides(impact, overrides)).toEqual({
      'collection-1': overrides['collection-1'],
      'collection-2': overrides['collection-2'],
    });
  });
});
