import { Box } from '@chakra-ui/react';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import MediaCarousel from '@/components/media-carousel';
import { toMediaCardModel } from '@/features/media/media-card-model';
import type { MovieWithMeta, TvWithMeta } from '@/features/media/media.types';

interface DiscoverySectionProps {
  data?: MovieWithMeta[] | TvWithMeta[];
  emptyDescription: string;
  emptyTitle: string;
  error: unknown;
  errorDescription: string;
  isFetching: boolean;
  isLoading: boolean;
  onRetry: () => void;
  title: string;
  viewAllTo?: string;
}

const DiscoverySection = ({
  data,
  emptyDescription,
  emptyTitle,
  error,
  errorDescription,
  isFetching,
  isLoading,
  onRetry,
  title,
  viewAllTo,
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
        title={title}
        data={(data ?? []).map(toMediaCardModel)}
        viewAllTo={viewAllTo}
      />
    )}
  </Box>
);

export default DiscoverySection;
