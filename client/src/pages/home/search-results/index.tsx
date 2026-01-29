import { Box, Flex, Separator } from '@chakra-ui/react';
import { useState } from 'react';
import SearchInput from '@/components/search-input';
import MediaTypeFilter from '@/components/media-type-filter';
import UsersSearchResult from './users-search-result';
import MediaSearchResults from './media-search-results';

const SearchResults = () => {
  const [searchQuery, setSearchQUery] = useState('');

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

        <SearchInput
          placeholder="Search for movies, tv shows and users"
          onSearchChange={(query) => {
            setSearchQUery(query);
          }}
          w={['full', '80%', '50%']}
        />
      </Flex>

      {searchQuery && (
        <>
          <UsersSearchResult searchQuery={searchQuery} />

          <Separator my={8} />

          <MediaSearchResults searchQuery={searchQuery} />
        </>
      )}
    </Box>
  );
};

export default SearchResults;
