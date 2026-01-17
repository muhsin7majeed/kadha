import { Box, Stack } from '@chakra-ui/react';

import MediaTypeFilter from '@/components/media-type-filter';
import { useMediaTypeValue } from '@/atoms/mediaType';
import TrendingMovies from './trending-movies';
import TrendingTvs from './trending-tvs';
import SearchResults from './search-results';

const Home = () => {
  const mediaType = useMediaTypeValue();

  return (
    <Box>
      <Stack gap={4}>
        <Stack gap={4} direction={['column', 'row']} alignItems="center" justifyContent="space-between">
          <MediaTypeFilter />
          <SearchResults />
        </Stack>

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
