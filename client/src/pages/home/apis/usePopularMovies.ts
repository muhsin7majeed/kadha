import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { Movie } from '@/types/media';

const fetchPopularMovies = async () => {
  const response = await api.get<{ movies: Movie[] }>('/api/media/popular-movies');
  return response.data.movies;
};

const usePopularMovies = () => {
  return useQuery({
    queryKey: ['popular-movies'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: () => fetchPopularMovies(),
  });
};

export default usePopularMovies;
