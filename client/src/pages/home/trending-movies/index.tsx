import { Box } from '@chakra-ui/react';

import EmptyState from '@/components/info-states/EmptyState';
import ErrorState from '@/components/info-states/ErrorState';
import MediaCarousal from '@/components/media-carousal';
import useTrendingMovies from '@/pages/home/apis/useTrendingMovies';

const TrendingMovies = () => {
  const { data: trendingMovies, isLoading, isFetching, error, refetch } = useTrendingMovies();

  return (
    <Box>
      {error ? (
        <ErrorState title="Error" description="Failed to fetch trending movies" onRetry={refetch} />
      ) : trendingMovies?.length === 0 ? (
        <EmptyState title="No trending movies" description="No trending movies found" />
      ) : (
        <MediaCarousal
          isLoading={isLoading}
          isFetching={isFetching}
          mediaType="movie"
          title="Trending Movies"
          data={trendingMovies || []}
        />
      )}
    </Box>
  );
};

export default TrendingMovies;
