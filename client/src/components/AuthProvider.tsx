import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { Box, Spinner } from '@chakra-ui/react';

import { authAtom, getStoredToken } from '@/store/auth';
import { useGetMe } from '@/pages/profile/apis/useGetMe';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [, setAuth] = useAtom(authAtom);
  const { data: me, isLoading } = useGetMe(Boolean(getStoredToken()));

  useEffect(() => {
    if (me) {
      setAuth({ user: { _id: me._id, username: me.username }, token: getStoredToken() });
    }
  }, [me]);

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
