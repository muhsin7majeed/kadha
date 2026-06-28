import { DataPrivacy } from '@/types/common';
import { ViewerFriendshipStatus } from './friendship-utils';

type LockedReason = 'PRIVATE' | 'FRIENDS_ONLY';

interface CanViewByPrivacyArgs {
  viewerId: string;
  ownerId: string;
  privacy: DataPrivacy;
  areFriends: boolean;
}

export const canViewByPrivacy = ({ viewerId, ownerId, privacy, areFriends }: CanViewByPrivacyArgs) => {
  if (viewerId === ownerId) {
    return true;
  }

  if (privacy === DataPrivacy.Everyone) {
    return true;
  }

  return privacy === DataPrivacy.Friends && areFriends;
};

export const getLockedReason = (privacy: DataPrivacy): LockedReason =>
  privacy === DataPrivacy.Friends ? 'FRIENDS_ONLY' : 'PRIVATE';

export const isBlockingRelationship = (friendshipStatus: ViewerFriendshipStatus) =>
  friendshipStatus === 'BLOCKED_BY_ME' || friendshipStatus === 'BLOCKED_ME';
