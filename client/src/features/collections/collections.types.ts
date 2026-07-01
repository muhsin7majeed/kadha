import { UserMedia } from '@/features/user-media/user-media.types';
import { DataPrivacy } from '@/types/common';

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string;
  privacy: DataPrivacy;
  created_at: Date;
  updated_at: Date;
  hasMedia?: boolean;
  owner?: UserSummary;
  members?: CollectionMember[];
  itemCount?: number;
  memberCount?: number;
  access?: CollectionAccess;
}

export type CollectionScope = 'all' | 'mine' | 'shared';
export type CollectionMemberRole = 'viewer' | 'editor';
export type CollectionAccessRole = 'owner' | CollectionMemberRole;

export interface UserSummary {
  id: string;
  username: string;
}

export interface CollectionAccess {
  relationship: 'owner' | 'member';
  role: CollectionAccessRole;
  canView: boolean;
  canEditItems: boolean;
  canManageSharing: boolean;
}

export interface CollectionMember {
  id: string;
  userId: string;
  role: CollectionMemberRole;
  createdAt: string;
  updatedAt: string;
  user: UserSummary;
}

export type CollectionInviteStatus = 'pending' | 'accepted' | 'rejected' | 'revoked';
export type CollectionInviteUserState = 'available' | 'pending' | 'member';

export interface CollectionInvite {
  id: string;
  collectionId: string;
  inviterId: string;
  inviteeId: string;
  role: CollectionMemberRole;
  status: CollectionInviteStatus;
  respondedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
  invitee: UserSummary;
  inviter?: UserSummary;
}

export interface CollectionInviteUserSearchResult extends UserSummary {
  state: CollectionInviteUserState;
  currentRole?: CollectionMemberRole;
}

export interface AddToCollectionPayload extends Omit<UserMedia, 'id' | 'userId'> {
  collectionId: string;
}

interface CollectionMedia extends Omit<UserMedia, 'genre_ids'> {
  collectionId: string;
  media_id: number;
  genre_ids: number[] | string;
  addedByUserId?: string | null;
  created_at: Date;
}
export interface CollectionDetails
  extends Omit<Collection, 'hasMedia' | 'owner' | 'members' | 'memberCount' | 'access'> {
  media: CollectionMedia[];
  owner: UserSummary;
  members: CollectionMember[];
  memberCount: number;
  access: CollectionAccess;
}

export interface CollectionFormFields {
  name: string;
  description: string;
  privacy: DataPrivacy;
}
