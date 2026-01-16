import { Flex, Skeleton } from '@chakra-ui/react';

const MediaCarousalSkeleton = () => {
  return (
    <Flex gap={4}>
      <Skeleton height="300px" flex="0 0 200px" />
      <Skeleton height="300px" flex="0 0 200px" />
      <Skeleton height="300px" flex="0 0 200px" />
      <Skeleton height="300px" flex="0 0 200px" />
      <Skeleton height="300px" flex="0 0 200px" />
      <Skeleton height="300px" flex="0 0 200px" />
    </Flex>
  );
};

export default MediaCarousalSkeleton;
