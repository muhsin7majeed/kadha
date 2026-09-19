import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { PaginatedResponse, ResourceAccessResponse } from '@/types/common';
import { InProgressTvSort, TvInProgressItem } from '../user-media.types';

export type TvInProgressAccessResponse = ResourceAccessResponse<TvInProgressItem[]> &
  Partial<PaginatedResponse<TvInProgressItem[]>>;

const fetchInProgressTv = async (
  page = 1,
  sort: InProgressTvSort = 'recent',
  limit = 20,
): Promise<TvInProgressAccessResponse> => {
  const response = await api.get<TvInProgressAccessResponse>('/api/user/in-progress', {
    params: {
      page,
      sort,
      limit,
    },
  });

  return response.data;
};

const useInProgressTv = (options: { enabled?: boolean; limit?: number; page?: number; sort?: InProgressTvSort } = {}) => {
  const page = options.page ?? 1;
  const sort = options.sort ?? 'recent';
  const limit = options.limit ?? 20;

  return useQuery({
    queryKey: queryKeys.inProgressTv(page, sort, limit),
    queryFn: () => fetchInProgressTv(page, sort, limit),
    enabled: options.enabled ?? true,
  });
};

export default useInProgressTv;
