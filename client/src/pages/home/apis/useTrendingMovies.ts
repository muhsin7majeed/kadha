import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';

const fetchTrendingMovies = async () => {
  const response = await api.get('/api/media/trending-movies');
  return response.data;
};

const useTrendingMovies = () => {
  return useQuery({
    queryKey: ['trending-movies'],
    queryFn: () => fetchTrendingMovies(),
  });
};

export default useTrendingMovies;
