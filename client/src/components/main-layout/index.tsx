import { Outlet } from 'react-router';
import { Box, VStack } from '@chakra-ui/react';

import TabBar from '../tabbar';
import Navbar from '../navbar';
import { useGenreMap } from '@/hooks/useGenreMap';

const MainLayout = () => {
  useGenreMap();

  return (
    <VStack alignItems="stretch" w="100%" height="100vh" py={4}>
      <Navbar />

      <Box height="100%" overflow="auto" my={4} css={{ scrollbarWidth: 'none' }}>
        <Outlet />
      </Box>

      <TabBar />
    </VStack>
  );
};

export default MainLayout;
