import usePopularMovies from '@/features/media/api/use-popular-movies';
import DiscoverySection from './discovery-section';

const PopularMovies = () => {
  const query = usePopularMovies();
  return (
    <DiscoverySection
      {...query}
      data={query.data}
      mediaType="movie"
      title="Popular Movies"
      emptyTitle="No popular movies"
      emptyDescription="No popular movies found"
      errorDescription="Failed to fetch popular movies"
      onRetry={() => void query.refetch()}
    />
  );
};

export default PopularMovies;
