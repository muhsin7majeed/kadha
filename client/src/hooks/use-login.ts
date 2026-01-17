import { storeToken } from '@/lib/localstorage';
import { AuthState } from '@/types/user';
import { useSetAuthAtom } from '@/atoms/auth-atom';

const useLoginAuth = () => {
  const setAuth = useSetAuthAtom();

  return (authState: AuthState) => {
    setAuth(authState);
    storeToken(authState.token || '');
  };
};

export default useLoginAuth;
