import { Box, Stack } from '@chakra-ui/react';

import MediaTypeFilter from '@/components/media-type-filter';
import { useMediaTypeValue } from '@/atoms/mediaType';
import TopRatedMovies from './top-rated-movies';
import TopRatedTvs from './top-rated-tvs';
import PopularMovies from './popular-movies';
import TrendingMovies from './trending-movies';
import TrendingTvs from './trending-tvs';
import PopularTvs from './popular-tvs';
import SearchResults from './search-results';

const Home = () => {
  const mediaType = useMediaTypeValue();

  return (
    <Box>
      <MediaTypeFilter chakraProps={{ mb: '2' }} />

      <Stack gap={4}>
        <SearchResults />

        {(mediaType === 'Movie' || mediaType === 'All') && <TrendingMovies />}
        {(mediaType === 'TV' || mediaType === 'All') && <TrendingTvs />}

        {(mediaType === 'Movie' || mediaType === 'All') && <TopRatedMovies />}
        {(mediaType === 'TV' || mediaType === 'All') && <TopRatedTvs />}

        {(mediaType === 'Movie' || mediaType === 'All') && <PopularMovies />}
        {(mediaType === 'TV' || mediaType === 'All') && <PopularTvs />}
      </Stack>
    </Box>
  );
};

export default Home;
