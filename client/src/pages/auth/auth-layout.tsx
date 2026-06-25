import { Box, Text } from '@chakra-ui/react';
import { Outlet } from 'react-router';
import { APP_CONFIG } from '@/config/app-config';

const AuthLayout = () => {
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
      p={4}
    >
      <Text fontSize="2xl" fontWeight="bold" textAlign="center">
        {APP_CONFIG.appName}
      </Text>

      <Outlet />
    </Box>
  );
};

export default AuthLayout;
