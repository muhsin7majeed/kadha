export type CollectionOwnershipOverride =
  | {
      collectionId: string;
      action: 'delete';
    }
  | {
      collectionId: string;
      action: 'transfer';
      newOwnerUserId: string;
    };

export interface AccountDeletionOwnershipPlan {
  automaticallyTransferEligibleCollections: boolean;
  overrides: CollectionOwnershipOverride[];
}

export interface DeletionImpactMember {
  memberId: string;
  userId: string;
  username: string;
  role: 'viewer' | 'editor';
  joinedAt: string;
}

export interface DeletionImpactCollection {
  id: string;
  name: string;
  itemCount: number;
  members: DeletionImpactMember[];
  automaticRecipientUserId: string;
}

export interface DeletionImpactResponse {
  impactFingerprint: string;
  isFinalAdministrator: boolean;
  ownedCollectionCount: number;
  unsharedOwnedCollectionCount: number;
  membershipsToLeaveCount: number;
  sharedOwnedCollections: DeletionImpactCollection[];
}

export type DeleteAccountResult = 'DELETED' | 'INVALID_CURRENT_PASSWORD' | 'LAST_ADMIN' | 'DELETION_IMPACT_CHANGED';
