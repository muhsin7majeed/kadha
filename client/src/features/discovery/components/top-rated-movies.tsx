import useTopRatedMovies from '@/features/media/api/use-top-rated-movies';
import DiscoverySection from './discovery-section';

const TopRatedMovies = () => {
  const query = useTopRatedMovies();
  return (
    <DiscoverySection
      {...query}
      data={query.data}
      title="Top Rated Movies"
      emptyTitle="No top rated movies"
      emptyDescription="No top rated movies found"
      errorDescription="Failed to fetch top rated movies"
      onRetry={() => void query.refetch()}
    />
  );
};

export default TopRatedMovies;
