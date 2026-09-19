import TrendingMovies from '@/features/discovery/components/trending-movies';
import TrendingTvs from '@/features/discovery/components/trending-tvs';

export const TrendingMoviesHomeSection = () => <TrendingMovies viewAllTo="/app/discover" />;
export const TrendingTvHomeSection = () => <TrendingTvs viewAllTo="/app/discover" />;
