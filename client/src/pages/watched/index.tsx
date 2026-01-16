import { Box, Center, SimpleGrid, Spinner } from '@chakra-ui/react';
import useWatched from './apis/useWatched';
import MediaCard from '@/components/media-card';
import EmptyState from '@/components/info-states/EmptyState';
import ErrorState from '@/components/info-states/ErrorState';
import PageHeader from '@/components/page-header';

const Watched = () => {
  const { data: watched, isLoading, isFetching, error, refetch } = useWatched();

  return (
    <Box>
      <PageHeader isFetching={isFetching}>Watched</PageHeader>

      {isLoading ? (
        <Center>
          <Spinner />
        </Center>
      ) : error ? (
        <ErrorState title="Error" description="Failed to fetch watched" onRetry={refetch} />
      ) : watched?.length === 0 ? (
        <EmptyState title="No watched found" description="Add movies to your watched to get started" />
      ) : (
        <SimpleGrid columns={[2, 4, 6]} gap={4}>
          {watched?.map((movie) => (
            <MediaCard key={movie.mediaId} media={movie} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default Watched;
