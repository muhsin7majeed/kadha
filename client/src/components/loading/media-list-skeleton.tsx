import { Box, SimpleGrid, Skeleton, Stack, VisuallyHidden } from '@chakra-ui/react';

interface MediaListSkeletonProps {
  label?: string;
}

const MediaListSkeleton = ({ label = 'Loading media' }: MediaListSkeletonProps) => (
  <Box role="status" aria-live="polite" aria-busy="true">
    <VisuallyHidden>{label}</VisuallyHidden>
    <SimpleGrid
      gridTemplateColumns={{
        base: 'repeat(auto-fit, minmax(min(10rem, 100%), 1fr))',
        sm: 'repeat(2, minmax(0, 1fr))',
        md: 'repeat(3, minmax(0, 1fr))',
        lg: 'repeat(4, minmax(0, 1fr))',
      }}
      gap={{ base: 2, sm: 4, md: 6 }}
    >
      {Array.from({ length: 8 }, (_, index) => (
        <Stack key={index} gap="3">
          <Skeleton aspectRatio="2 / 3" borderRadius="lg" />
          <Skeleton height="5" width="80%" />
          <Skeleton height="4" width="55%" />
        </Stack>
      ))}
    </SimpleGrid>
  </Box>
);

export default MediaListSkeleton;
