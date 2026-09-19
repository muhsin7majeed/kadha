import useTrendingTvs from '@/features/media/api/use-trending-tvs';
import DiscoverySection from './discovery-section';

const TrendingTvs = ({ viewAllTo }: { viewAllTo?: string }) => {
  const query = useTrendingTvs();
  return (
    <DiscoverySection
      {...query}
      data={query.data}
      title="Trending TV Shows"
      emptyTitle="No trending TV shows"
      emptyDescription="No trending TV shows found"
      errorDescription="Failed to fetch trending TV shows"
      onRetry={() => void query.refetch()}
      viewAllTo={viewAllTo}
    />
  );
};

export default TrendingTvs;
