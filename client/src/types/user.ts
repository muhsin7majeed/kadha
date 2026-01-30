import { DataPrivacy, FriendStatus } from './common';

export interface User {
  id: string;
  username: string;
  profilePrivacy: DataPrivacy;
}

export interface UserSearchResult extends User {
  friendshipStatus: FriendStatus | null;
  isRequestSender: boolean;
}

export interface AuthState {
  user: Omit<User, 'profilePrivacy'> | null;
  status: 'pending' | 'authenticated' | 'unauthenticated';
}
