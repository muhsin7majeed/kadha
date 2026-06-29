import { Box, SimpleGrid, Text } from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import MediaCard from '@/components/media-card';
import PaginationControls from '@/components/pagination-controls';
import useSearchMedia from '@/features/media/api/use-search-media';
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
      <Text color="fg.muted" fontSize="sm" mb={4}>
        {data.pagination.total} results
      </Text>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={4}>
        {data.data.map((media) => (
          <MediaCard key={`${media.media_type}:${media.media_id}`} media={media} onNavigate={onClose} />
        ))}
      </SimpleGrid>

      <PaginationControls pagination={data.pagination} isDisabled={isFetching} onPageChange={onPageChange} />
    </Box>
  );
};

export default MediaSearchResults;
