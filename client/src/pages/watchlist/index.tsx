import { LuBookmark } from 'react-icons/lu';
import useWatchList from './apis/use-watch-list';
import MediaListPage from '@/components/media-list-page';
import { Container } from '@chakra-ui/react';

const Watchlist = () => {
  const { data: watchList, isLoading, isFetching, error, refetch } = useWatchList();

  return (
    <Container maxW="6xl" py={{ base: 8, md: 12 }}>
      <MediaListPage
        title="Watchlist"
        description="Movies and shows you're planning to watch. Your personal queue of entertainment waiting to be discovered."
        data={watchList}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        refetch={refetch}
        emptyState={{
          title: 'Your watchlist is empty',
          description:
            "Start adding movies and shows you want to watch. They'll appear here so you never forget what's next!",
          icon: <LuBookmark />,
        }}
        errorDescription="Failed to fetch watchlist"
        loadingText="Loading your watchlist..."
        spinnerColor="darkorange"
      />
    </Container>
  );
};

export default Watchlist;
