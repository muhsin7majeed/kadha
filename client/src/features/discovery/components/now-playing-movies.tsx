import useNowPlayingMovies from '@/features/media/api/use-now-playing-movies';
import DiscoverySection from './discovery-section';

const NowPlayingMovies = () => {
  const query = useNowPlayingMovies();
  return (
    <DiscoverySection
      {...query}
      data={query.data}
      mediaType="movie"
      title="In Theaters"
      emptyTitle="No movies in theaters"
      emptyDescription="No current theatrical releases found"
      errorDescription="Failed to fetch movies in theaters"
      onRetry={() => void query.refetch()}
    />
  );
};

export default NowPlayingMovies;
