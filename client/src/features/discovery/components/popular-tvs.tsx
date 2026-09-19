import usePopularTvs from '@/features/media/api/use-popular-tvs';
import DiscoverySection from './discovery-section';

const PopularTvs = () => {
  const query = usePopularTvs();
  return (
    <DiscoverySection
      {...query}
      data={query.data}
      title="Popular TV Shows"
      emptyTitle="No popular TV shows"
      emptyDescription="No popular TV shows found"
      errorDescription="Failed to fetch popular TV shows"
      onRetry={() => void query.refetch()}
    />
  );
};

export default PopularTvs;
