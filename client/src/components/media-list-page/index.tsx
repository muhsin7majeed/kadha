import { Box } from '@chakra-ui/react';
import { useRef } from 'react';
import MediaCardGrid from '@/components/media-card-grid';
import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import { UserMedia } from '@/features/user-media/user-media.types';
import { MovieWithMeta } from '@/features/media/media.types';
import { TvWithMeta } from '@/features/media/media.types';
import { PaginationMeta } from '@/types/common';
import PageHeader from '../page-header';
import PaginationControls from '../pagination-controls';
import { toMediaCardModel } from '@/features/media/media-card-model';
import MediaListSkeleton from '../loading/media-list-skeleton';

interface MediaListPageProps {
  title: string;
  description: string;
  headerAction?: React.ReactNode;
  controls?: React.ReactNode;
  results?: React.ReactNode;
  data: (UserMedia | MovieWithMeta | TvWithMeta)[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
  emptyState: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
  errorDescription: string;
  loadingText: string;
  detailsPathPrefix?: string;
  pagination?: PaginationMeta;
  showActions?: boolean;
  showLibraryMetadata?: boolean;
  showPersonalRating?: boolean;
  onPageChange?: (page: number) => void;
}

const MediaListPage = ({
  title,
  description,
  headerAction,
  controls,
  results,
  data,
  isLoading,
  isFetching,
  error,
  refetch,
  emptyState,
  errorDescription,
  loadingText,
  detailsPathPrefix,
  pagination,
  showActions,
  showLibraryMetadata,
  showPersonalRating,
  onPageChange,
}: MediaListPageProps) => {
  const resultsRef = useRef<HTMLDivElement>(null);
  const isRefreshing = isFetching && !isLoading && data !== undefined;

  return (
    <Box>
      <PageHeader action={headerAction} isRefreshing={isRefreshing} subHeader={description}>
        {title}
      </PageHeader>

      {controls}

      {isLoading ? (
        <MediaListSkeleton label={loadingText} />
      ) : error ? (
        <Box py={10}>
          <ErrorState title="Error" description={errorDescription} onRetry={refetch} />
        </Box>
      ) : data?.length === 0 ? (
        <Box py={10}>
          <EmptyState title={emptyState.title} description={emptyState.description} icon={emptyState.icon} />
        </Box>
      ) : (
        <>
          <Box ref={resultsRef} aria-busy={isRefreshing}>
            <Box>
              {results ?? (
                <MediaCardGrid
                  detailsPathPrefix={detailsPathPrefix}
                  media={data?.map(toMediaCardModel) ?? []}
                  showActions={showActions}
                  showLibraryMetadata={showLibraryMetadata}
                  showPersonalRating={showPersonalRating}
                />
              )}
            </Box>
          </Box>
          {onPageChange && (
            <PaginationControls
              pagination={pagination}
              isDisabled={isFetching}
              onPageChange={onPageChange}
              scrollTargetRef={resultsRef}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default MediaListPage;
