import { Box } from '@chakra-ui/react';

import EmptyState from '@/components/info-states/EmptyState';
import ErrorState from '@/components/info-states/ErrorState';
import MediaCarousal from '@/components/media-carousal';
import usePopularMovies from '../apis/usePopularMovies';

const PopularMovies = () => {
  const { data: popularMovies, isLoading, isFetching, error, refetch } = usePopularMovies();

  return (
    <Box>
      {error ? (
        <ErrorState title="Error" description="Failed to fetch popular movies" onRetry={refetch} />
      ) : popularMovies?.length === 0 ? (
        <EmptyState title="No popular movies" description="No popular movies found" />
      ) : (
        <MediaCarousal
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
