import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { Tv } from '@/types/media';

const fetchPopularTvs = async () => {
  const response = await api.get<{ tv: Tv[] }>('/api/media/popular-tvs');
  return response.data.tv;
};

const usePopularTvs = () => {
  return useQuery({
    queryKey: ['popular-tvs'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: () => fetchPopularTvs(),
  });
};

export default usePopularTvs;
