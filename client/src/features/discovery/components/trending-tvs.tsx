import useTrendingTvs from '@/features/media/api/use-trending-tvs';
import DiscoverySection from './discovery-section';

const TrendingTvs = () => {
  const query = useTrendingTvs();
  return (
    <DiscoverySection
      {...query}
      data={query.data}
      mediaType="tv"
      title="Trending TV Shows"
      emptyTitle="No trending TV shows"
      emptyDescription="No trending TV shows found"
      errorDescription="Failed to fetch trending TV shows"
      onRetry={() => void query.refetch()}
    />
  );
};

export default TrendingTvs;
