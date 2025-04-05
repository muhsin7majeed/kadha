import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { Tv } from '@/lib/types';

const fetchTopRatedTvs = async () => {
  const response = await api.get<{ tv: Tv[] }>('/api/media/top-rated-tvs');
  return response.data.tv;
};

const useTopRatedTvs = () => {
  return useQuery({
    queryKey: ['top-rated-tvs'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: () => fetchTopRatedTvs(),
  });
};

export default useTopRatedTvs;
