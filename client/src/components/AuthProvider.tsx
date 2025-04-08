import { useEffect } from 'react';
import { Box, Spinner } from '@chakra-ui/react';

import { useAuthAtom, useSetAuthAtom } from '@/atoms/authAtom';
import { useGetMe } from '@/pages/profile/apis/useGetMe';
import { getStoredToken } from '@/lib/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useAuthAtom();
  const setAuth = useSetAuthAtom();

  const { data: userInfo, isLoading } = useGetMe();

  useEffect(() => {
    if (!getStoredToken()) {
      setAuth({
        user: null,
        token: null,
        isLoading: false,
      });
    }
  }, [setAuth]);

  useEffect(() => {
    if (userInfo && !auth.user) {
      setAuth({
        user: { _id: userInfo._id, username: userInfo.username },
        token: getStoredToken(),
        isLoading: false,
      });
    }
  }, [auth.user, setAuth, userInfo]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="sm" />
      </Box>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
