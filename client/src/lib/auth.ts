import { useNavigate } from 'react-router';

import { authInitialState, useSetAuthAtom } from '@/atoms/authAtom';
import { AuthState } from '@/types/user';

export const useLoginAuth = () => {
  const setAuth = useSetAuthAtom();

  return (authState: AuthState) => {
    setAuth(authState);
    storeToken(authState.token || '');
  };
};

export const useLogout = () => {
  const setAuth = useSetAuthAtom();
  const navigate = useNavigate();

  return () => {
    setAuth(authInitialState);
    removeStoredToken();
    navigate('/auth/login');
  };
};

export const storeToken = (token: string) => localStorage.setItem('token', token);
export const getStoredToken = () => localStorage.getItem('token');
export const removeStoredToken = () => localStorage.removeItem('token');
