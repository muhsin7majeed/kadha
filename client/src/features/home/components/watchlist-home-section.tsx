import MediaCarousel from '@/components/media-carousel';
import useWatchList from '@/features/user-media/api/use-watch-list';
import { toMediaCardModel } from '@/features/media/media-card-model';
import HomeSectionError from './home-section-error';

const WatchlistHomeSection = () => {
  const query = useWatchList(undefined, { enabled: true, page: 1 });

  if (query.error) {
    return (
      <HomeSectionError
        title="From Your Watchlist"
        description="Your watchlist could not be loaded."
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (!query.isLoading && query.data?.data.length === 0) return null;

  return (
    <MediaCarousel
      title="From Your Watchlist"
      data={(query.data?.data ?? []).map(toMediaCardModel)}
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      viewAllTo="/app/watchlist"
    />
  );
};

export default WatchlistHomeSection;
