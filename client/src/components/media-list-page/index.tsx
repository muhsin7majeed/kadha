import { Box, Center, Heading, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react';
import MediaCard from '@/components/media-card';
import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import SyncSpinner from '@/components/spinners';
import { UserMedia } from '@/types/user-media';
import { MovieWithMeta } from '@/types/media';
import { TvWithMeta } from '@/types/media';

interface MediaListPageProps {
  title: string;
  description: string;
  data: UserMedia[] | MovieWithMeta[] | TvWithMeta[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
  emptyState: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
  errorDescription: string;
  loadingText: string;
  spinnerColor?: string;
}

const MediaListPage = ({
  title,
  description,
  data,
  isLoading,
  isFetching,
  error,
  refetch,
  emptyState,
  errorDescription,
  loadingText,
  spinnerColor = 'darkorange',
}: MediaListPageProps) => {
  return (
    <Box>
      <Box mb={10}>
        <Heading size={{ base: '2xl', md: '3xl' }}>
          {title}
          {isFetching && <SyncSpinner ml="1" />}
        </Heading>

        <Text fontSize="lg" color="fg.muted" maxW="2xl">
          {description}
        </Text>
      </Box>

      {isLoading ? (
        <Center py={20}>
          <VStack gap={4}>
            <Spinner size="xl" color={spinnerColor} />
            <Text color="fg.muted">{loadingText}</Text>
          </VStack>
        </Center>
      ) : error ? (
        <Box py={10}>
          <ErrorState title="Error" description={errorDescription} onRetry={refetch} />
        </Box>
      ) : data?.length === 0 ? (
        <Box py={10}>
          <EmptyState title={emptyState.title} description={emptyState.description} icon={emptyState.icon} />
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6}>
          {data?.map((media) => (
            <MediaCard key={media.id} media={media} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default MediaListPage;
