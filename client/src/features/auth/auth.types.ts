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
  user: {
    id: string;
    username: string;
  } | null;
  status: 'pending' | 'authenticated' | 'unauthenticated';
}
