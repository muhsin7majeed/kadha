import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { PaginatedResponse, ResourceAccessResponse } from '@/types/common';
import { InProgressTvSort, TvInProgressItem } from '../user-media.types';

export type TvInProgressAccessResponse = ResourceAccessResponse<TvInProgressItem[]> &
  Partial<PaginatedResponse<TvInProgressItem[]>>;

const fetchInProgressTv = async (page = 1, sort: InProgressTvSort = 'recent'): Promise<TvInProgressAccessResponse> => {
  const response = await api.get<TvInProgressAccessResponse>('/api/user/in-progress', {
    params: {
      page,
      sort,
    },
  });

  return response.data;
};

const useInProgressTv = (options: { page?: number; sort?: InProgressTvSort } = {}) => {
  const page = options.page ?? 1;
  const sort = options.sort ?? 'recent';

  return useQuery({
    queryKey: queryKeys.inProgressTv(page, sort),
    queryFn: () => fetchInProgressTv(page, sort),
  });
};

export default useInProgressTv;
