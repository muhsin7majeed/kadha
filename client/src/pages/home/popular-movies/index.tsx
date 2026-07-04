import { Box } from '@chakra-ui/react';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import MediaCarousel from '@/components/media-carousel';
import usePopularMovies from '@/features/media/api/use-popular-movies';

const PopularMovies = () => {
  const { data: popularMovies, isLoading, isFetching, error, refetch } = usePopularMovies();

  return (
    <Box>
      {error ? (
        <ErrorState title="Error" description="Failed to fetch popular movies" onRetry={refetch} />
      ) : popularMovies?.length === 0 ? (
        <EmptyState title="No popular movies" description="No popular movies found" />
      ) : (
        <MediaCarousel
          isLoading={isLoading}
          isFetching={isFetching}
          mediaType="movie"
          title="Popular Movies"
          data={popularMovies || []}
        />
      )}
    </Box>
  );
};

export default PopularMovies;
