import { atom } from 'jotai';

export interface User {
  _id: string;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

export const authAtom = atom<AuthState>(initialState);

export const setAuth = (user: User, token: string) => {
  localStorage.setItem('token', token);
  return { user, token };
};

export const clearAuth = () => {
  removeStoredToken();
  return initialState;
};

export const getStoredToken = () => localStorage.getItem('token');
export const removeStoredToken = () => localStorage.removeItem('token');
