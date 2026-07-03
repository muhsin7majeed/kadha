import { Outlet, useLocation } from 'react-router';
import { Box, Container } from '@chakra-ui/react';

import TabBar from '../tabbar';
import Navbar from '../navbar';
import { useGenreMap } from '@/features/media/api/use-genre-map';

const MainLayout = () => {
  useGenreMap();
  const { pathname } = useLocation();
  const hasPagePadding = !pathname.startsWith('/app/media/');

  return (
    <Box>
      <Navbar />

      <Container
        w="100%"
        minH="100vh"
        maxW={hasPagePadding ? '6xl' : 'full'}
        px={hasPagePadding ? { base: 4, md: 6 } : 0}
      >
        <Box pt={hasPagePadding ? 2 : 0} pb={hasPagePadding ? { base: 24, md: 28 } : 20}>
          <Outlet />
        </Box>

        <Box
          position="fixed"
          bottom={[2, 4]}
          left={0}
          right={0}
          zIndex={2}
          p={2}
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
