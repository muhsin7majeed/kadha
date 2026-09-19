import useOnTheAirTvs from '@/features/media/api/use-on-the-air-tvs';
import DiscoverySection from './discovery-section';

const OnTheAirTvs = () => {
  const query = useOnTheAirTvs();
  return (
    <DiscoverySection
      {...query}
      data={query.data}
      mediaType="tv"
      title="Airing Now"
      emptyTitle="No TV shows airing now"
      emptyDescription="No currently airing TV shows found"
      errorDescription="Failed to fetch TV shows airing now"
      onRetry={() => void query.refetch()}
    />
  );
};

export default OnTheAirTvs;
