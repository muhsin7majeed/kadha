import { Box } from '@chakra-ui/react';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import MediaCarousel from '@/components/media-carousel';
import type { MovieWithMeta, TvWithMeta } from '@/features/media/media.types';

interface DiscoverySectionProps {
  data?: MovieWithMeta[] | TvWithMeta[];
  emptyDescription: string;
  emptyTitle: string;
  error: unknown;
  errorDescription: string;
  isFetching: boolean;
  isLoading: boolean;
  mediaType: 'movie' | 'tv';
  onRetry: () => void;
  title: string;
}

const DiscoverySection = ({
  data,
  emptyDescription,
  emptyTitle,
  error,
  errorDescription,
  isFetching,
  isLoading,
  mediaType,
  onRetry,
  title,
}: DiscoverySectionProps) => (
  <Box>
    {error ? (
      <ErrorState title="Error" description={errorDescription} onRetry={onRetry} />
    ) : data?.length === 0 ? (
      <EmptyState title={emptyTitle} description={emptyDescription} />
    ) : (
      <MediaCarousel
        isLoading={isLoading}
        isFetching={isFetching}
        mediaType={mediaType}
        title={title}
        data={data ?? []}
      />
    )}
  </Box>
);

export default DiscoverySection;
