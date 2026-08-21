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

export interface DeletionImpact {
  impactFingerprint: string;
  isFinalAdministrator: boolean;
  ownedCollectionCount: number;
  unsharedOwnedCollectionCount: number;
  membershipsToLeaveCount: number;
  sharedOwnedCollections: DeletionImpactCollection[];
}

export type CollectionOwnershipOverride =
  | { collectionId: string; action: 'delete' }
  | { collectionId: string; action: 'transfer'; newOwnerUserId: string };

export interface AccountDeletionOwnershipPlan {
  automaticallyTransferEligibleCollections: boolean;
  overrides: CollectionOwnershipOverride[];
}

export interface DeleteAccountPayload {
  currentPassword: string;
  confirmation: string;
  impactFingerprint: string;
  ownershipPlan: AccountDeletionOwnershipPlan;
}

export type OwnershipOverridesByCollection = Record<string, CollectionOwnershipOverride | undefined>;
