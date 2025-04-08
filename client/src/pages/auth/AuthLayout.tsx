import { Box, Text } from '@chakra-ui/react';
import { Outlet } from 'react-router';

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
    >
      <Text fontSize="2xl" fontWeight="bold" textAlign="center">
        What To Watch
      </Text>

      <Outlet />
    </Box>
  );
};

export default AuthLayout;
