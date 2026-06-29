import { useQuery } from '@tanstack/react-query';

import { AdminUserSummary, AdminUsersParams } from '@/features/admin/admin.types';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { PaginatedResponse } from '@/types/common';

const getAdminUsers = async (params: AdminUsersParams) => {
  const { role, ...rest } = params;
  const response = await api.get<PaginatedResponse<AdminUserSummary[]>>('/api/admin/users', {
    params: {
      ...rest,
      ...(role === 'ALL' ? {} : { role }),
    },
  });

  return response.data;
};

const useAdminUsers = (params: AdminUsersParams) => {
  return useQuery({
    queryKey: queryKeys.adminUsersList(params),
    queryFn: () => getAdminUsers(params),
  });
};

export default useAdminUsers;
