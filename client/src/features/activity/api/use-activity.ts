import { useQuery } from '@tanstack/react-query';

import { UserActivity } from '@/features/activity/activity.types';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { PaginatedResponse } from '@/types/common';

const fetchActivity = async (page = 1): Promise<PaginatedResponse<UserActivity[]>> => {
  const response = await api.get<PaginatedResponse<UserActivity[]>>('/api/user/activity', {
    params: { page },
  });

  return response.data;
};

const useActivity = (page = 1) => {
  return useQuery({
    queryKey: queryKeys.activityPage(page),
    queryFn: () => fetchActivity(page),
  });
};

export default useActivity;
