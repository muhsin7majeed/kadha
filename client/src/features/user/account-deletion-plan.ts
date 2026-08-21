import {
  AccountDeletionOwnershipPlan,
  CollectionOwnershipOverride,
  DeletionImpact,
  OwnershipOverridesByCollection,
} from './account-deletion.types';

export interface ResolvedCollectionOutcome {
  collectionId: string;
  action: 'delete' | 'transfer';
  newOwnerUserId?: string;
  isOverride: boolean;
}

export interface ResolvedDeletionPlan {
  outcomes: ResolvedCollectionOutcome[];
  transferredCollectionCount: number;
  deletedCollectionCount: number;
  collaboratorsLosingAccessCount: number;
}

export const resolveDeletionPlan = (
  impact: DeletionImpact,
  automaticallyTransferEligibleCollections: boolean,
  overrides: OwnershipOverridesByCollection,
): ResolvedDeletionPlan => {
  const collaboratorsLosingAccess = new Set<string>();
  const outcomes = impact.sharedOwnedCollections.map((collection): ResolvedCollectionOutcome => {
    const override = overrides[collection.id];
    if (override?.action === 'transfer') {
      return {
        collectionId: collection.id,
        action: 'transfer',
        newOwnerUserId: override.newOwnerUserId,
        isOverride: true,
      };
    }

    const action = override?.action === 'delete' || !automaticallyTransferEligibleCollections ? 'delete' : 'transfer';
    if (action === 'delete') {
      collection.members.forEach((member) => collaboratorsLosingAccess.add(member.userId));
      return { collectionId: collection.id, action, isOverride: Boolean(override) };
    }

    return {
      collectionId: collection.id,
      action,
      newOwnerUserId: collection.automaticRecipientUserId,
      isOverride: false,
    };
  });

  const transferredCollectionCount = outcomes.filter((outcome) => outcome.action === 'transfer').length;

  return {
    outcomes,
    transferredCollectionCount,
    deletedCollectionCount: impact.unsharedOwnedCollectionCount + outcomes.length - transferredCollectionCount,
    collaboratorsLosingAccessCount: collaboratorsLosingAccess.size,
  };
};

export const toOwnershipPlan = (
  automaticallyTransferEligibleCollections: boolean,
  overrides: OwnershipOverridesByCollection,
): AccountDeletionOwnershipPlan => ({
  automaticallyTransferEligibleCollections,
  overrides: Object.values(overrides).filter((override): override is CollectionOwnershipOverride => Boolean(override)),
});

export const keepValidOwnershipOverrides = (
  impact: DeletionImpact,
  overrides: OwnershipOverridesByCollection,
): OwnershipOverridesByCollection => {
  const valid: OwnershipOverridesByCollection = {};

  for (const collection of impact.sharedOwnedCollections) {
    const override = overrides[collection.id];
    if (!override) continue;
    if (
      override.action === 'delete' ||
      collection.members.some((member) => member.userId === override.newOwnerUserId)
    ) {
      valid[collection.id] = override;
    }
  }

  return valid;
};
