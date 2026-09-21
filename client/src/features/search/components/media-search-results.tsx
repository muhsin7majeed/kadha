import { Box, SimpleGrid, Text } from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import MediaCard from '@/components/media-card';
import PaginationControls from '@/components/pagination-controls';
import useSearchMedia from '@/features/media/api/use-search-media';
import { toMediaCardModel } from '@/features/media/media-card-model';
import SearchLoadingState from '@/features/search/components/search-loading-state';
import { SearchTab } from '@/features/search/search.types';

interface MediaSearchResultsProps {
  activeTab: SearchTab;
  query: string;
  page: number;
  open: boolean;
  onClose: () => void;
  onPageChange: (page: number) => void;
}

const MediaSearchResults = ({ activeTab, query, page, open, onClose, onPageChange }: MediaSearchResultsProps) => {
  const mediaType = activeTab === 'tv' ? 'tv' : 'movie';
  const enabled = open && (activeTab === 'movie' || activeTab === 'tv') && query.length >= 2;
  const { data, isLoading, isFetching, error, refetch } = useSearchMedia(mediaType, query, page, enabled);

  if (!enabled) {
    return null;
  }

  if (isLoading) {
    return <SearchLoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        title="Error"
        description={`Failed to fetch ${mediaType === 'movie' ? 'movies' : 'TV'}`}
        onRetry={refetch}
      />
    );
  }

  if (!data || data.data.length === 0) {
    return <EmptyState title="No results found" description="Try a different search." icon={<LuSearch />} />;
  }

  return (
    <Box>
      <Text color="fg.muted" textStyle="supporting" mb={4}>
        {data.pagination.total} results
      </Text>

      <SimpleGrid
        gridTemplateColumns={{
          base: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
          xl: 'repeat(5, minmax(0, 1fr))',
        }}
        gap={4}
      >
        {data.data.map((media) => (
          <MediaCard
            key={`${media.media_type}:${media.media_id}`}
            media={toMediaCardModel(media)}
            onNavigate={onClose}
            width="100%"
            maxW={{ base: 'none', sm: '220px' }}
          />
        ))}
      </SimpleGrid>

      <PaginationControls pagination={data.pagination} isDisabled={isFetching} onPageChange={onPageChange} />
    </Box>
  );
};

export default MediaSearchResults;
