export interface User {
  id: string;
  username: string;
}

export interface AuthState {
  user: User | null;
  status: 'pending' | 'authenticated' | 'unauthenticated';
}
