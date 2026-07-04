import { Box } from '@chakra-ui/react';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import MediaCarousel from '@/components/media-carousel';
import useTopRatedTvs from '@/features/media/api/use-top-rated-tvs';

const TopRatedTvs = () => {
  const { data: topRatedTvs, isLoading, isFetching, error, refetch } = useTopRatedTvs();

  return (
    <Box>
      {error ? (
        <ErrorState title="Error" description="Failed to fetch top rated tvs" onRetry={refetch} />
      ) : topRatedTvs?.length === 0 ? (
        <EmptyState title="No top rated tvs" description="No top rated tvs found" />
      ) : (
        <MediaCarousel
          isLoading={isLoading}
          isFetching={isFetching}
          mediaType="tv"
          title="Top Rated TV Shows"
          data={topRatedTvs || []}
        />
      )}
    </Box>
  );
};

export default TopRatedTvs;
