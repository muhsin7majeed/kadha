import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { Box, Spinner } from '@chakra-ui/react';

import { authAtom, getStoredToken } from '@/store/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [auth, setAuth] = useAtom(authAtom);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getStoredToken();

      if (token && !auth.user) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setAuth({
          user: { id: '1', username: 'dummyuser' },
          token,
        });
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [auth.user, setAuth]);

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
