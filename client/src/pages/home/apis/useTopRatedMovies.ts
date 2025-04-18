import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { Movie } from '@/types/media';

const fetchTopRatedMovies = async () => {
  const response = await api.get<{ movies: Movie[] }>('/api/media/top-rated-movies');
  return response.data.movies;
};

const useTopRatedMovies = () => {
  return useQuery({
    queryKey: ['top-rated-movies'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: () => fetchTopRatedMovies(),
  });
};

export default useTopRatedMovies;
