import { Stack } from '@chakra-ui/react';

import TrendingMovies from '@/features/discovery/components/trending-movies';
import TrendingTvs from '@/features/discovery/components/trending-tvs';

const Home = () => (
  <Stack gap="4">
    <TrendingMovies />
    <TrendingTvs />
  </Stack>
);

export default Home;
