import { HStack, Spinner, VisuallyHidden } from '@chakra-ui/react';

interface LoadingStatusProps {
  label?: string;
}

const LoadingStatus = ({ label = 'Refreshing content' }: LoadingStatusProps) => (
  <HStack role="status" aria-live="polite" flexShrink="0">
    <Spinner size="sm" color="brand.solid" aria-hidden />
    <VisuallyHidden>{label}</VisuallyHidden>
  </HStack>
);

export default LoadingStatus;
