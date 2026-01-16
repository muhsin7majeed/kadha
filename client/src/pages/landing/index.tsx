import { Box, Heading, HStack } from '@chakra-ui/react';
import { Link } from 'react-router';

const Landing = () => {
  return (
    <Box>
      <Heading>Landing Page</Heading>

      <HStack gap={4}>
        <Link to="/auth/login">Login</Link>
        <Link to="/auth/register">Register</Link>
      </HStack>
    </Box>
  );
};

export default Landing;
