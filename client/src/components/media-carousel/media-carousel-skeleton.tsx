import { Box, Flex, Skeleton } from '@chakra-ui/react';

const MediaCarouselSkeleton = () => {
  return (
    <Box>
      <Skeleton height="40px" width="300px" mb="4" />

      <Flex gap={4} overflowX="auto">
        <Skeleton height="300px" flex="0 0 200px" />
        <Skeleton height="300px" flex="0 0 200px" />
        <Skeleton height="300px" flex="0 0 200px" />
        <Skeleton height="300px" flex="0 0 200px" />
        <Skeleton height="300px" flex="0 0 200px" />
        <Skeleton height="300px" flex="0 0 200px" />
      </Flex>
    </Box>
  );
};

export default MediaCarouselSkeleton;
