import { Outlet } from 'react-router';
import { Box, Container } from '@chakra-ui/react';

import TabBar from '../tabbar';
import Navbar from '../navbar';
import { useGenreMap } from '@/hooks/useGenreMap';

const MainLayout = () => {
  useGenreMap();

  return (
    <Box py={2}>
      <Navbar />

      <Container w="100%" height="100vh" py={4}>
        <Box height="100%" overflow="auto" paddingBottom={20} my={4} css={{ scrollbarWidth: 'none' }}>
          <Outlet />
        </Box>

        <Box
          position="fixed"
          bottom={4}
          left={0}
          right={0}
          zIndex={2}
          p={[2, 4]}
          backdropFilter="blur(10px)"
          rounded="full"
          width="fit-content"
          mx={'auto'}
        >
          <TabBar />
        </Box>
      </Container>
    </Box>
  );
};

export default MainLayout;
