import useTrendingMovies from '@/features/media/api/use-trending-movies';
import DiscoverySection from './discovery-section';

const TrendingMovies = () => {
  const query = useTrendingMovies();
  return (
    <DiscoverySection
      {...query}
      data={query.data}
      mediaType="movie"
      title="Trending Movies"
      emptyTitle="No trending movies"
      emptyDescription="No trending movies found"
      errorDescription="Failed to fetch trending movies"
      onRetry={() => void query.refetch()}
    />
  );
};

export default TrendingMovies;
