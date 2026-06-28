import { Box, Stack } from '@chakra-ui/react';

import { useMediaTypeValue } from '@/atoms/media-type';
import TrendingMovies from './trending-movies';
import TrendingTvs from './trending-tvs';

const Home = () => {
  const mediaType = useMediaTypeValue();

  return (
    <Box>
      <Stack gap={4}>
        {(mediaType === 'Movie' || mediaType === 'All') && <TrendingMovies />}
        {(mediaType === 'TV' || mediaType === 'All') && <TrendingTvs />}

        {/* {(mediaType === 'Movie' || mediaType === 'All') && <TopRatedMovies />}
        {(mediaType === 'TV' || mediaType === 'All') && <TopRatedTvs />}

        {(mediaType === 'TV' || mediaType === 'All') && <PopularTvs />}
        {(mediaType === 'Movie' || mediaType === 'All') && <PopularMovies />} */}
      </Stack>
    </Box>
  );
};

export default Home;
