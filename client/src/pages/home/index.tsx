import { Box, Stack } from '@chakra-ui/react';

import { useMediaTypeValue } from '@/atoms/media-type';
import NowPlayingMovies from './now-playing-movies';
import OnTheAirTvs from './on-the-air-tvs';
import PopularMovies from './popular-movies';
import PopularTvs from './popular-tvs';
import TopRatedMovies from './top-rated-movies';
import TopRatedTvs from './top-rated-tvs';
import TrendingMovies from './trending-movies';
import TrendingTvs from './trending-tvs';
import UpcomingMovies from './upcoming-movies';

const Home = () => {
  const mediaType = useMediaTypeValue();

  return (
    <Box>
      <Stack gap={4}>
        {(mediaType === 'Movie' || mediaType === 'All') && <TrendingMovies />}
        {(mediaType === 'TV' || mediaType === 'All') && <TrendingTvs />}

        {(mediaType === 'Movie' || mediaType === 'All') && <PopularMovies />}
        {(mediaType === 'TV' || mediaType === 'All') && <PopularTvs />}

        {(mediaType === 'Movie' || mediaType === 'All') && <NowPlayingMovies />}
        {(mediaType === 'TV' || mediaType === 'All') && <OnTheAirTvs />}

        {(mediaType === 'Movie' || mediaType === 'All') && <UpcomingMovies />}

        {(mediaType === 'Movie' || mediaType === 'All') && <TopRatedMovies />}
        {(mediaType === 'TV' || mediaType === 'All') && <TopRatedTvs />}
      </Stack>
    </Box>
  );
};

export default Home;
