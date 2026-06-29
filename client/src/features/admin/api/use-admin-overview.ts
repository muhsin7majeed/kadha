import { useQuery } from '@tanstack/react-query';

import { AdminOverview } from '@/features/admin/admin.types';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';

const getAdminOverview = async () => {
  const response = await api.get<BaseResponse<AdminOverview>>('/api/admin/overview');

  return response.data.data;
};

const useAdminOverview = () => {
  return useQuery({
    queryKey: queryKeys.adminOverview,
    queryFn: getAdminOverview,
  });
};

export default useAdminOverview;
