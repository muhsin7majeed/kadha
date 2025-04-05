import { Box } from '@chakra-ui/react';

import EmptyState from '@/components/info-states/EmptyState';
import ErrorState from '@/components/info-states/ErrorState';
import MediaCarousal from '@/components/media-carousal';
import useTopRatedTvs from '@/pages/home/apis/useTopRatedTvs';

const TopRatedTvs = () => {
  const { data: topRatedTvs, isLoading, isFetching, error, refetch } = useTopRatedTvs();

  return (
    <Box>
      {error ? (
        <ErrorState title="Error" description="Failed to fetch top rated tvs" onRetry={refetch} />
      ) : topRatedTvs?.length === 0 ? (
        <EmptyState title="No top rated tvs" description="No top rated tvs found" />
      ) : (
        <MediaCarousal
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
