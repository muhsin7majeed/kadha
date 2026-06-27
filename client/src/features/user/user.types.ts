import { DataPrivacy, FriendStatus } from '@/types/common';

export interface User {
  id: string;
  username: string;
  profilePrivacy: DataPrivacy;
}

export interface UserSearchResult extends UserActor {
  id: string;
  username: string;
}

/**
 * User actor is a user that is related to the current user.
 * It can be a friend, a request sender, a request receiver, or a blocked user.
 */
export interface UserActor {
  id: string;
  username: string;
  friendshipStatus: FriendStatus;
  isRequestSender: boolean;
}
