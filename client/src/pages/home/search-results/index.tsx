import { Box, Flex, Loader, SimpleGrid } from '@chakra-ui/react';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import { useState } from 'react';
import SearchInput from '@/components/search-input';
import useSearchMedia from './apis/use-search-media';
import MediaCard from '@/components/media-card';
import MediaTypeFilter from '@/components/media-type-filter';

const SearchResults = () => {
  const [searchQuery, setSearchQUery] = useState('');

  const { data: results, isLoading, isFetching, error, refetch } = useSearchMedia(searchQuery);

  return (
    <Box>
      <Flex gap={4} direction={['column', 'row']} justifyContent={['center', 'space-between']} alignItems="center">
        <MediaTypeFilter />

        <SearchInput onSearchChange={(query) => setSearchQUery(query)} w={['full', '80%', '50%']} />
      </Flex>

      {searchQuery && (
        <>
          {error ? (
            <ErrorState title="Error" description="Failed to fetch media" onRetry={refetch} />
          ) : results?.length === 0 ? (
            <EmptyState title="Try another query" description={`Count't find any result for '${searchQuery}'`} />
          ) : isLoading || isFetching ? (
            <Loader />
          ) : (
            <SimpleGrid columns={[2, 4, 6]} gap={4}>
              {results?.slice(0, 5).map((media) => (
                <MediaCard key={media.id} media={media} />
              ))}
            </SimpleGrid>
          )}
        </>
      )}
    </Box>
  );
};

export default SearchResults;
