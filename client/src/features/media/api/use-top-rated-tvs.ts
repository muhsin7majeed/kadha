import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { TvWithMeta } from '@/types/media';
import { useQuery } from '@tanstack/react-query';

const fetchTopRatedTvs = async () => {
  const response = await api.get<BaseResponse<TvWithMeta[]>>('/api/media/top-rated-tvs');
  return response.data.data;
};

const useTopRatedTvs = () => {
  return useQuery({
    queryKey: queryKeys.topRatedTvs,
    staleTime: 1000 * 60 * 5,
    queryFn: () => fetchTopRatedTvs(),
  });
};

export default useTopRatedTvs;
