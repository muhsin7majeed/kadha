import { LuBookmark } from 'react-icons/lu';
import useWatchList from '@/features/user-media/api/use-watch-list';
import useOwnerMediaQuery from '@/features/user-media/api/use-owner-media-query';
import OwnerMediaLibrary from '@/features/user-media/components/owner-media-library';

const Watchlist = () => {
  const { query, updateQuery } = useOwnerMediaQuery(false);
  const { data: watchList, isLoading, isFetching, isPlaceholderData, error, refetch } = useWatchList(undefined, { ownerQuery: query });

  return (
    <OwnerMediaLibrary
      title="Watchlist"
      addedLabel="Recently watchlisted"
      firstAddedLabel="First watchlisted"
      description="Movies and shows you're planning to watch. Your personal queue of entertainment waiting to be discovered."
      response={watchList}
      isLoading={isLoading}
      isFetching={isFetching}
      isPlaceholderData={isPlaceholderData}
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
      libraryKey="watchlist"
      supportsPersonalRating={false}
      query={query}
      updateQuery={updateQuery}
    />
  );
};

export default Watchlist;
