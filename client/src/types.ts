export interface LocationState {
  from?: {
    pathname: string;
  };
}

export interface User {
  _id: string;
  username: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}
