import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { Tv } from '@/lib/types';

const fetchTrendingTvs = async () => {
  const response = await api.get<{ tv: Tv[] }>('/api/media/trending-tvs');
  return response.data.tv;
};

const useTrendingTvs = () => {
  return useQuery({
    queryKey: ['trending-tvs'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: () => fetchTrendingTvs(),
  });
};

export default useTrendingTvs;
