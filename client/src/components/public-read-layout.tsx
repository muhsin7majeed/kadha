import { Box, Container } from '@chakra-ui/react';
import { Outlet } from 'react-router';

import Navbar from './navbar';

const PublicReadLayout = () => (
  <Box minH="100vh">
    <Navbar />
    <Container maxW="6xl" px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
      <Outlet />
    </Container>
  </Box>
);

export default PublicReadLayout;
