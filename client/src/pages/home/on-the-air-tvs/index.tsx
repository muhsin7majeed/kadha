import { Box } from '@chakra-ui/react';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import MediaCarousel from '@/components/media-carousel';
import useOnTheAirTvs from '@/features/media/api/use-on-the-air-tvs';

const OnTheAirTvs = () => {
  const { data: onTheAirTvs, isLoading, isFetching, error, refetch } = useOnTheAirTvs();

  return (
    <Box>
      {error ? (
        <ErrorState title="Error" description="Failed to fetch shows on the air" onRetry={refetch} />
      ) : onTheAirTvs?.length === 0 ? (
        <EmptyState title="No shows on the air" description="No shows on the air found" />
      ) : (
        <MediaCarousel
          isLoading={isLoading}
          isFetching={isFetching}
          mediaType="tv"
          title="On TV Now"
          data={onTheAirTvs || []}
        />
      )}
    </Box>
  );
};

export default OnTheAirTvs;
