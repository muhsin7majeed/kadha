import { Box, Heading } from '@chakra-ui/react';
import { Outlet } from 'react-router';

import BetaDisclosure from '@/components/beta-disclosure';
import { APP_CONFIG } from '@/config/app-config';

const AuthLayout = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="stretch"
      justifyContent="center"
      minH="100vh"
      gap={6}
      maxW="md"
      mx="auto"
      p={4}
    >
      <Heading as="h1" textStyle="pageTitle" textAlign="center">
        {APP_CONFIG.appName}
      </Heading>

      <BetaDisclosure contained={false} />

      <Outlet />
    </Box>
  );
};

export default AuthLayout;
