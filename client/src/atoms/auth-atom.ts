import { atom, useAtom, useSetAtom } from 'jotai';
import { AuthState } from '@/features/auth/auth.types';

const authAtom = atom<AuthState>({
  user: null,
  status: 'pending',
});

export const useAuthAtom = () => {
  return useAtom(authAtom);
};

export const useSetAuthAtom = () => {
  return useSetAtom(authAtom);
};
