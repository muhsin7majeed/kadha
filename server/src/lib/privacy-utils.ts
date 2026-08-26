import { DataPrivacy, LockedReason } from '@/types/common';
import { ViewerFriendshipStatus } from './friendship-utils';

interface CanViewByPrivacyArgs {
  viewerId?: string;
  ownerId: string;
  privacy: DataPrivacy;
  areFriends: boolean;
}

export const canViewByPrivacy = ({ viewerId, ownerId, privacy, areFriends }: CanViewByPrivacyArgs) => {
  if (viewerId === ownerId) {
    return true;
  }

  if (privacy === DataPrivacy.Public) {
    return true;
  }

  if (privacy === DataPrivacy.KadhaUsers) {
    return !!viewerId;
  }

  return privacy === DataPrivacy.Friends && areFriends;
};

export const getLockedReason = (privacy: DataPrivacy, viewerId?: string): LockedReason => {
  if ((privacy === DataPrivacy.KadhaUsers || privacy === DataPrivacy.Friends) && !viewerId) {
    return 'SIGN_IN_REQUIRED';
  }

  return privacy === DataPrivacy.Friends ? 'FRIENDS_ONLY' : 'PRIVATE';
};

export const isBlockingRelationship = (friendshipStatus: ViewerFriendshipStatus) =>
  friendshipStatus === 'BLOCKED_BY_ME' || friendshipStatus === 'BLOCKED_ME';
