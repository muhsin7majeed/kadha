import ErrorState from '@/components/info-states/ErrorState';
import PageHeader from '@/components/page-header';
import { Box, Center, SimpleGrid, Spinner } from '@chakra-ui/react';
import EmptyState from '@/components/info-states/EmptyState';
import useLiked from './apis/useLiked';
import MediaCard from '@/components/media-card';

const Liked = () => {
  const { data: liked, isLoading, isFetching, error, refetch } = useLiked();

  return (
    <Box>
      <PageHeader isFetching={isFetching}>Liked</PageHeader>

      {isLoading ? (
        <Center>
          <Spinner />
        </Center>
      ) : error ? (
        <ErrorState title="Error" description="Failed to fetch liked" onRetry={refetch} />
      ) : liked?.length === 0 ? (
        <EmptyState title="No liked found" description="Add movies to your liked to get started" />
      ) : (
        <SimpleGrid columns={[2, 4, 6]} gap={4}>
          {liked?.map((movie) => (
            <MediaCard key={movie.id} media={movie} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default Liked;
