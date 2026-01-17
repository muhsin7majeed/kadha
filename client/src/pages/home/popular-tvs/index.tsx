import { Box } from '@chakra-ui/react';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import MediaCarousal from '@/components/media-carousal';
import usePopularTvs from '../apis/use-popular-tvs';

const PopularTvs = () => {
  const { data: popularTvs, isLoading, isFetching, error, refetch } = usePopularTvs();

  return (
    <Box>
      {error ? (
        <ErrorState title="Error" description="Failed to fetch popular tvs" onRetry={refetch} />
      ) : popularTvs?.length === 0 ? (
        <EmptyState title="No popular tvs" description="No popular tvs found" />
      ) : (
        <MediaCarousal
          isLoading={isLoading}
          isFetching={isFetching}
          mediaType="tv"
          title="Popular Tvs"
          data={popularTvs || []}
        />
      )}
    </Box>
  );
};

export default PopularTvs;
