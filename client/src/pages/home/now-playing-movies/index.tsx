import { Box } from '@chakra-ui/react';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import MediaCarousel from '@/components/media-carousel';
import useNowPlayingMovies from '@/features/media/api/use-now-playing-movies';

const NowPlayingMovies = () => {
  const { data: nowPlayingMovies, isLoading, isFetching, error, refetch } = useNowPlayingMovies();

  return (
    <Box>
      {error ? (
        <ErrorState title="Error" description="Failed to fetch now playing movies" onRetry={refetch} />
      ) : nowPlayingMovies?.length === 0 ? (
        <EmptyState title="No now playing movies" description="No now playing movies found" />
      ) : (
        <MediaCarousel
          isLoading={isLoading}
          isFetching={isFetching}
          mediaType="movie"
          title="Now Playing"
          data={nowPlayingMovies || []}
        />
      )}
    </Box>
  );
};

export default NowPlayingMovies;
