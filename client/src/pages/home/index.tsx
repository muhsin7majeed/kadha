import { Box, Stack } from '@chakra-ui/react';

import MediaTypeFilter from '@/components/media-type-filter';
import TrendingMovies from './trending-movies';
import TrendingTvs from './trending-tvs';
import { useMediaTypeValue } from '@/atoms/mediaType';

const Home = () => {
  const mediaType = useMediaTypeValue();

  return (
    <Box>
      <MediaTypeFilter chakraProps={{ mb: '2' }} />

      <Stack gap={4}>
        {(mediaType === 'Movie' || mediaType === 'All') && <TrendingMovies />}
        {(mediaType === 'TV' || mediaType === 'All') && <TrendingTvs />}
      </Stack>
    </Box>
  );
};

export default Home;
