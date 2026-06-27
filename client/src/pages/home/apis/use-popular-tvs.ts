import api from '@/lib/axios-instance';
import { useQuery } from '@tanstack/react-query';
import { TvWithMeta } from '@/types/media';
import { BaseResponse } from '@/types/common';
import { queryKeys } from '@/lib/query-keys';

const fetchPopularTvs = async () => {
  const response = await api.get<BaseResponse<TvWithMeta[]>>('/api/media/popular-tvs');
  return response.data.data;
};

const usePopularTvs = () => {
  return useQuery({
    queryKey: queryKeys.popularTvs,
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: () => fetchPopularTvs(),
  });
};

export default usePopularTvs;
