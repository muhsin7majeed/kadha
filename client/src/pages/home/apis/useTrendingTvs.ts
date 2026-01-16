import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { Media } from '@/types/media';
import { BaseResponse } from '@/types/common';

const fetchTrendingTvs = async () => {
  const response = await api.get<BaseResponse<Media[]>>('/api/media/trending-tvs');
  return response.data.data;
};

const useTrendingTvs = () => {
  return useQuery({
    queryKey: ['trending-tvs'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: () => fetchTrendingTvs(),
  });
};

export default useTrendingTvs;
