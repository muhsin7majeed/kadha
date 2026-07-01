import { Spinner, Text, VStack } from '@chakra-ui/react';

const SearchLoadingState = () => (
  <VStack py={12} gap={3}>
    <Spinner color="brand.fg" />
    <Text color="fg.muted" fontSize="sm">
      Searching
    </Text>
  </VStack>
);

export default SearchLoadingState;
