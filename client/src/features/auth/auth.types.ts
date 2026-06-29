import { User } from '@/features/user/user.types';

type AuthUser = Pick<User, 'id' | 'username'> & Partial<Omit<User, 'id' | 'username'>>;

export interface LoginInputs {
  username: string;
  password: string;
}

export interface RegisterInputs extends LoginInputs {
  confirmPassword: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface AuthState {
  user: AuthUser | null;
  status: 'pending' | 'authenticated' | 'unauthenticated';
}
