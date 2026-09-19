import useTopRatedTvs from '@/features/media/api/use-top-rated-tvs';
import DiscoverySection from './discovery-section';

const TopRatedTvs = () => {
  const query = useTopRatedTvs();
  return (
    <DiscoverySection
      {...query}
      data={query.data}
      title="Top Rated TV Shows"
      emptyTitle="No top rated TV shows"
      emptyDescription="No top rated TV shows found"
      errorDescription="Failed to fetch top rated TV shows"
      onRetry={() => void query.refetch()}
    />
  );
};

export default TopRatedTvs;
