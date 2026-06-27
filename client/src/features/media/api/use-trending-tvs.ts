import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { TvWithMeta } from '@/types/media';
import { useQuery } from '@tanstack/react-query';

const fetchTrendingTvs = async () => {
  const response = await api.get<BaseResponse<TvWithMeta[]>>('/api/media/trending-tvs');
  return response.data.data;
};

const useTrendingTvs = () => {
  return useQuery({
    queryKey: queryKeys.trendingTvs,
    staleTime: 1000 * 60 * 5,
    queryFn: () => fetchTrendingTvs(),
  });
};

export default useTrendingTvs;
