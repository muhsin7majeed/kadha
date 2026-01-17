import { Box, Center, SimpleGrid, Spinner } from '@chakra-ui/react';
import useWatchList from './apis/use-watch-list';
import MediaCard from '@/components/media-card';
import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';

const Watchlist = () => {
  const { data: watchList, isLoading, isFetching, error, refetch } = useWatchList();

  return (
    <Box>
      <PageHeader isFetching={isFetching}>Watchlist</PageHeader>

      {isLoading ? (
        <Center>
          <Spinner />
        </Center>
      ) : error ? (
        <ErrorState title="Error" description="Failed to fetch watchlist" onRetry={refetch} />
      ) : watchList?.length === 0 ? (
        <EmptyState title="No watchlist found" description="Add movies to your watchlist to get started" />
      ) : (
        <SimpleGrid columns={[2, 4, 6]} gap={4}>
          {watchList?.map((movie) => (
            <MediaCard key={movie.id} media={movie} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default Watchlist;
