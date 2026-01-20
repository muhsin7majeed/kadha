import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import SearchInput from '@/components/search-input';
import useSearchMedia from './apis/use-search-media';
import MediaTypeFilter from '@/components/media-type-filter';
import MediaListPage from '@/components/media-list-page';
import { LuSearch } from 'react-icons/lu';

const SearchResults = () => {
  const [searchQuery, setSearchQUery] = useState('');

  const { data: results, isLoading, isFetching, error, refetch } = useSearchMedia(searchQuery);

  return (
    <Box>
      <Flex
        gap={4}
        direction={['column', 'row']}
        justifyContent={['center', 'space-between']}
        alignItems="center"
        mb={4}
      >
        <MediaTypeFilter />

        <SearchInput onSearchChange={(query) => setSearchQUery(query)} w={['full', '80%', '50%']} />
      </Flex>

      {Boolean(searchQuery) && (
        <MediaListPage
          title="Search Results"
          description={`Found ${results?.length} results for "${searchQuery}"`}
          data={results}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
          refetch={refetch}
          emptyState={{
            title: 'No results found',
            description: 'Try searching for a different movie or show.',
            icon: <LuSearch />,
          }}
          errorDescription="Failed to fetch search results"
          loadingText="Loading search results..."
          spinnerColor="darkorange"
        />
      )}
    </Box>
  );
};

export default SearchResults;
