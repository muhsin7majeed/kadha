export interface LoginInputs {
  username: string;
  password: string;
}

export interface RegisterInputs extends LoginInputs {
  confirmPassword: string;
  watchRegion: string;
}

export interface RecoverAccountInputs {
  username: string;
  recoveryCode: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ManageRecoveryCodeInputs {
  currentPassword: string;
}

export interface ChangePasswordInputs {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  userId: string;
}

export interface RegisterResponse extends LoginResponse {
  recoveryCode: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface RecoveryCodeStatusResponse {
  configured: boolean;
  createdAt: string | null;
}

export interface ManageRecoveryCodeResponse {
  recoveryCode: string;
  createdAt: string;
}

export interface RecoverAccountResponse {
  message: string;
  recoveryCode: string;
}

export interface ChangePasswordResponse {
  message: string;
}
