import { Box } from '@chakra-ui/react';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import MediaCarousel from '@/components/media-carousel';
import useUpcomingMovies from '@/features/media/api/use-upcoming-movies';

const UpcomingMovies = () => {
  const { data: upcomingMovies, isLoading, isFetching, error, refetch } = useUpcomingMovies();

  return (
    <Box>
      {error ? (
        <ErrorState title="Error" description="Failed to fetch upcoming movies" onRetry={refetch} />
      ) : upcomingMovies?.length === 0 ? (
        <EmptyState title="No upcoming movies" description="No upcoming movies found" />
      ) : (
        <MediaCarousel
          isLoading={isLoading}
          isFetching={isFetching}
          mediaType="movie"
          title="Coming Soon"
          data={upcomingMovies || []}
        />
      )}
    </Box>
  );
};

export default UpcomingMovies;
