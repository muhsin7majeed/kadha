import { removeStoredToken } from '@/lib/localstorage';
import { useNavigate } from 'react-router';
import { authInitialState, useSetAuthAtom } from '@/atoms/auth-atom';

const useLogout = () => {
  const setAuth = useSetAuthAtom();
  const navigate = useNavigate();

  return () => {
    setAuth(authInitialState);
    removeStoredToken();
    navigate('/auth/login');
  };
};

export default useLogout;
