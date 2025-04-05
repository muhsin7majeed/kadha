import { Outlet } from 'react-router';
import TabBar from '../tabbar';
import Navbar from '../navbar';
import { Box, VStack } from '@chakra-ui/react';

const MainLayout = () => {
  return (
    <VStack alignItems="stretch" w="100%" height="100vh" py={4}>
      <Navbar />

      <Box height="100%" overflow="auto" my={4}>
        <Outlet />
      </Box>

      <TabBar />
    </VStack>
  );
};

export default MainLayout;
