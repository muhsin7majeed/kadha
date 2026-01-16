import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { Movie } from '@/types/media';

const fetchWatched = async () => {
  const response = await api.get<{ movies: Movie[] }>('/api/user/watched');
  return response.data.movies;
};

const useWatched = () => {
  return useQuery({
    queryKey: ['watched'],
    queryFn: () => fetchWatched(),
  });
};

export default useWatched;
