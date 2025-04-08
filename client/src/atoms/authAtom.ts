import { AuthState } from '@/types';
import { atom, useAtomValue, useSetAtom } from 'jotai';

export const authInitialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
};

const authAtom = atom<AuthState>(authInitialState);
export const useAuthAtom = () => useAtomValue(authAtom);
export const useSetAuthAtom = () => useSetAtom(authAtom);
