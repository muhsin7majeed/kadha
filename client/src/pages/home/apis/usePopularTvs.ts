import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { TvWithMeta } from '@/types/media';
import { BaseResponse } from '@/types/common';

const fetchPopularTvs = async () => {
  const response = await api.get<BaseResponse<TvWithMeta[]>>('/api/media/popular-tvs');
  return response.data.data;
};

const usePopularTvs = () => {
  return useQuery({
    queryKey: ['popular-tvs'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: () => fetchPopularTvs(),
  });
};

export default usePopularTvs;
