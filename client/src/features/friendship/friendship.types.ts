export type FriendshipType = 'friends' | 'sent' | 'received' | 'blocked';

export interface Friend {
  id: string;
  username: string;
}
