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
        <Box
          key={pathname}
          className="kadha-route-transition"
          pt={hasPagePadding ? 2 : 0}
          pb={hasPagePadding ? { base: 24, md: 24 } : 20}
        >
          <Outlet />
        </Box>
      </Container>

      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        zIndex={2}
        bg="bg"
        borderTopWidth="1px"
        borderColor="border"
        pb="env(safe-area-inset-bottom)"
        px={{ base: 0, md: 4 }}
      >
        <TabBar />
      </Box>
    </Box>
  );
};

export default MainLayout;
