export interface LoginInputs {
  username: string;
  password: string;
}

export interface RegisterInputs extends LoginInputs {
  confirmPassword: string;
  watchRegion: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  userId: string;
}

export interface RefreshResponse {
  accessToken: string;
}
