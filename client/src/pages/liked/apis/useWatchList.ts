import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { Movie } from '@/types/media';

const fetchWatchList = async () => {
  const response = await api.get<{ movies: Movie[] }>('/api/user/watchlist');
  return response.data.movies;
};

const useWatchList = () => {
  return useQuery({
    queryKey: ['watch-list'],
    queryFn: () => fetchWatchList(),
  });
};

export default useWatchList;
