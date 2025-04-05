import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { Movie } from '@/lib/types';

const fetchTrendingMovies = async () => {
  const response = await api.get<{ movies: Movie[] }>('/api/media/trending-movies');
  return response.data.movies;
};

const useTrendingMovies = () => {
  return useQuery({
    queryKey: ['trending-movies'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: () => fetchTrendingMovies(),
  });
};

export default useTrendingMovies;
