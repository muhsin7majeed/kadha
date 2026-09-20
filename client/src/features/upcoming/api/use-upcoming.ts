import { useQuery } from '@tanstack/react-query';

import type { UpcomingRange, UpcomingResponse } from '@/features/upcoming/upcoming.types';
import api from '@/lib/axios-instance';
import { upcomingQueryKeys } from '@/lib/query-keys';
import type { BaseResponse } from '@/types/common';

const fetchUpcoming = async (range: UpcomingRange) => {
  const response = await api.get<BaseResponse<UpcomingResponse>>('/api/upcoming', { params: range });
  return response.data.data;
};

const useUpcoming = (range: UpcomingRange) =>
  useQuery({
    queryKey: upcomingQueryKeys.schedule(range),
    queryFn: () => fetchUpcoming(range),
  });

export default useUpcoming;
