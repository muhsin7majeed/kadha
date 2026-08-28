import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { TvWithMeta } from '@/features/media/media.types';
import { useQuery } from '@tanstack/react-query';

const fetchOnTheAirTvs = async () => {
  const response = await api.get<BaseResponse<TvWithMeta[]>>('/api/media/on-the-air-tvs');
  return response.data.data;
};

const useOnTheAirTvs = () => {
  return useQuery({
    queryKey: queryKeys.onTheAirTvs,
    staleTime: 1000 * 60 * 5,
    queryFn: () => fetchOnTheAirTvs(),
  });
};

export default useOnTheAirTvs;
