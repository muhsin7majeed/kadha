import { Box, Flex, Skeleton, Stack, VisuallyHidden } from '@chakra-ui/react';

interface MediaCarouselSkeletonProps {
  label: string;
}

const MediaCarouselSkeleton = ({ label }: MediaCarouselSkeletonProps) => {
  return (
    <Box role="status" aria-live="polite" aria-busy="true">
      <VisuallyHidden>{label}</VisuallyHidden>
      <Skeleton height="8" width={{ base: '48', md: '72' }} mb="4" />

      <Flex gap="4" overflow="hidden">
        {Array.from({ length: 6 }, (_, index) => (
          <Stack key={index} flex={{ base: '0 0 10rem', md: '0 0 12rem' }} gap="3">
            <Skeleton aspectRatio="2 / 3" borderRadius="lg" />
            <Skeleton height="5" width="80%" />
          </Stack>
        ))}
      </Flex>
    </Box>
  );
};

export default MediaCarouselSkeleton;
