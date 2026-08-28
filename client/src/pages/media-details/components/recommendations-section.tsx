import { Box } from '@chakra-ui/react';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import MediaCarousel from '@/components/media-carousel';
import useMediaRecommendations from '@/features/media/api/use-media-recommendations';
import { MediaType } from '@/types/common';

interface RecommendationsSectionProps {
  mediaType: MediaType;
  id: string;
}

const RecommendationsSection = ({ mediaType, id }: RecommendationsSectionProps) => {
  const { data: recommendations, isLoading, isFetching, error, refetch } = useMediaRecommendations(mediaType, id);

  return (
    <Box>
      {error ? (
        <ErrorState title="Error" description="Failed to fetch recommendations" onRetry={refetch} />
      ) : recommendations?.data.length === 0 ? (
        <EmptyState title="No recommendations yet" description="TMDB does not have recommendations for this title yet." />
      ) : (
        <MediaCarousel
          isLoading={isLoading}
          isFetching={isFetching}
          mediaType={mediaType}
          title="More like this"
          data={recommendations?.data || []}
        />
      )}
    </Box>
  );
};

export default RecommendationsSection;
