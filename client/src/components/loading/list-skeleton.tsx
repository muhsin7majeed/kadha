import { Box, Skeleton, Stack, VisuallyHidden } from '@chakra-ui/react';

interface ListSkeletonProps {
  label?: string;
  rows?: number;
}

const ListSkeleton = ({ label = 'Loading content', rows = 5 }: ListSkeletonProps) => (
  <Box role="status" aria-live="polite" aria-busy="true">
    <VisuallyHidden>{label}</VisuallyHidden>
    <Stack gap="3">
      {Array.from({ length: rows }, (_, index) => (
        <Box key={index} borderWidth="1px" borderColor="border.subtle" borderRadius="lg" p="4">
          <Stack gap="3">
            <Skeleton height="5" width={{ base: '70%', md: '40%' }} />
            <Skeleton height="4" width={{ base: '90%', md: '65%' }} />
          </Stack>
        </Box>
      ))}
    </Stack>
  </Box>
);

export default ListSkeleton;
