import { DataPrivacy } from './common';

export interface User {
  id: string;
  username: string;
  profilePrivacy: DataPrivacy;
}

export interface AuthState {
  user: User | null;
  status: 'pending' | 'authenticated' | 'unauthenticated';
}
