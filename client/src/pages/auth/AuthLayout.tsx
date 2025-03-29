import { Box, Text } from '@chakra-ui/react';
import { Outlet, Navigate } from 'react-router';
import { useAtom } from 'jotai';

import { authAtom } from '@/store/auth';

const AuthLayout = () => {
  const [auth] = useAtom(authAtom);

  if (auth.user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="stretch"
      justifyContent="center"
      height="100vh"
      gap={10}
      maxW="md"
      mx="auto"
    >
      <Text fontSize="2xl" fontWeight="bold" textAlign="center">
        What To Watch
      </Text>

      <Outlet />
    </Box>
  );
};

export default AuthLayout;
