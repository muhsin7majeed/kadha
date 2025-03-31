import { Button, Heading, Text, VStack } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router';

import { authAtom, clearAuth } from '@/store/auth';
import useTrendingMovies from './apis/useTrendingMovies';

const Home = () => {
  const [auth, setAuth] = useAtom(authAtom);
  const navigate = useNavigate();

  const { data: trendingMovies } = useTrendingMovies();

  const handleLogout = () => {
    setAuth(clearAuth());
    navigate('/auth/login');
  };

  console.log(trendingMovies);

  return (
    <VStack gap={4} align="stretch">
      <Heading>Welcome, {auth.user?.username}!</Heading>
      <Text>This is a protected page. You can only see this if you're logged in.</Text>
      <Button onClick={handleLogout} colorScheme="red" variant="outline">
        Logout
      </Button>
    </VStack>
  );
};

export default Home;
