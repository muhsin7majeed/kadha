import { useQuery } from '@tanstack/react-query';

import { AdminUserDetail } from '@/features/admin/admin.types';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';

const getAdminUser = async (id: string) => {
  const response = await api.get<BaseResponse<AdminUserDetail>>(`/api/admin/users/${id}`);

  return response.data.data;
};

const useAdminUser = (id?: string) => {
  return useQuery({
    queryKey: queryKeys.adminUser(id),
    queryFn: () => getAdminUser(id as string),
    enabled: !!id,
  });
};

export default useAdminUser;
