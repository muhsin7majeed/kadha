import { Box, Loader, SimpleGrid } from '@chakra-ui/react';

import EmptyState from '@/components/info-states/EmptyState';
import ErrorState from '@/components/info-states/ErrorState';
import { useState } from 'react';
import SearchInput from '@/components/search-input';
import useSearchMedia from './useSearchMedia';
import MediaCard from '@/components/media-card';

const SearchResults = () => {
  const [searchQuery, setSearchQUery] = useState('');

  const { data: searchMedia, isLoading, isFetching, error, refetch } = useSearchMedia(searchQuery);

  return (
    <Box>
      <SearchInput mb="3" onSearchChange={(query) => setSearchQUery(query)} />

      {searchQuery && (
        <>
          {error ? (
            <ErrorState title="Error" description="Failed to fetch media" onRetry={refetch} />
          ) : searchMedia?.length === 0 ? (
            <EmptyState title="Try another query" description={`Count't find any result for '${searchQuery}'`} />
          ) : isLoading || isFetching ? (
            <Loader />
          ) : (
            <SimpleGrid columns={[2, 4, 6]} gap={4}>
              {searchMedia?.slice(0, 5).map((media) => (
                <MediaCard key={media.mediaId} media={media} />
              ))}
            </SimpleGrid>
          )}
        </>
      )}
    </Box>
  );
};

export default SearchResults;
