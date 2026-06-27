import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { TvWithMeta } from '@/types/media';
import { useQuery } from '@tanstack/react-query';

const fetchPopularTvs = async () => {
  const response = await api.get<BaseResponse<TvWithMeta[]>>('/api/media/popular-tvs');
  return response.data.data;
};

const usePopularTvs = () => {
  return useQuery({
    queryKey: queryKeys.popularTvs,
    staleTime: 1000 * 60 * 5,
    queryFn: () => fetchPopularTvs(),
  });
};

export default usePopularTvs;
