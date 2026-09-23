import { Stack } from '@chakra-ui/react';

import { useMediaType } from '@/atoms/media-type';
import MediaTypeSegmentedControl, {
  type MediaTypeSegmentValue,
} from '@/components/media-type-segmented-control';
import PageHeader from '@/components/page-header';
import NowPlayingMovies from '@/features/discovery/components/now-playing-movies';
import OnTheAirTvs from '@/features/discovery/components/on-the-air-tvs';
import PopularMovies from '@/features/discovery/components/popular-movies';
import PopularTvs from '@/features/discovery/components/popular-tvs';
import TopRatedMovies from '@/features/discovery/components/top-rated-movies';
import TopRatedTvs from '@/features/discovery/components/top-rated-tvs';
import TrendingMovies from '@/features/discovery/components/trending-movies';
import TrendingTvs from '@/features/discovery/components/trending-tvs';
import UpcomingMovies from '@/features/discovery/components/upcoming-movies';

const Discover = () => {
  const [mediaType, setMediaType] = useMediaType();
  const showMovies = mediaType === 'Movie' || mediaType === 'All';
  const showTv = mediaType === 'TV' || mediaType === 'All';
  const segmentValue = mediaType.toLowerCase() as MediaTypeSegmentValue;

  const handleMediaTypeChange = (value: MediaTypeSegmentValue) => {
    setMediaType(value === 'all' ? 'All' : value === 'movie' ? 'Movie' : 'TV');
  };

  return (
    <Stack gap="6">
      <Stack gap="4" align={{ base: 'stretch', md: 'flex-start' }}>
        <PageHeader subHeader="Browse what is trending, popular, airing, upcoming, and highly rated.">
          Discover
        </PageHeader>
        <MediaTypeSegmentedControl
          aria-label="Filter discovery by media type"
          value={segmentValue}
          onValueChange={handleMediaTypeChange}
        />
      </Stack>

      <Stack gap="4">
        {showMovies ? <TrendingMovies /> : null}
        {showTv ? <TrendingTvs /> : null}
        {showMovies ? <PopularMovies /> : null}
        {showTv ? <PopularTvs /> : null}
        {showMovies ? <NowPlayingMovies /> : null}
        {showTv ? <OnTheAirTvs /> : null}
        {showMovies ? <UpcomingMovies /> : null}
        {showMovies ? <TopRatedMovies /> : null}
        {showTv ? <TopRatedTvs /> : null}
      </Stack>
    </Stack>
  );
};

export default Discover;
