import useUpcomingMovies from '@/features/media/api/use-upcoming-movies';
import DiscoverySection from './discovery-section';

const UpcomingMovies = () => {
  const query = useUpcomingMovies();
  return (
    <DiscoverySection
      {...query}
      data={query.data}
      title="Upcoming Movies"
      emptyTitle="No upcoming movies"
      emptyDescription="No upcoming movies found"
      errorDescription="Failed to fetch upcoming movies"
      onRetry={() => void query.refetch()}
    />
  );
};

export default UpcomingMovies;
