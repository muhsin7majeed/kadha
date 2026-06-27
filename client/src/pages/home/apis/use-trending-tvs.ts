import api from '@/lib/axios-instance';
import { useQuery } from '@tanstack/react-query';
import { TvWithMeta } from '@/types/media';
import { BaseResponse } from '@/types/common';
import { queryKeys } from '@/lib/query-keys';

const fetchTrendingTvs = async () => {
  const response = await api.get<BaseResponse<TvWithMeta[]>>('/api/media/trending-tvs');
  return response.data.data;
};

const useTrendingTvs = () => {
  return useQuery({
    queryKey: queryKeys.trendingTvs,
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: () => fetchTrendingTvs(),
  });
};

export default useTrendingTvs;
