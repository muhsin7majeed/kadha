import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster-store';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse, UserRole } from '@/types/common';
import { AdminUserSummary } from '@/features/admin/admin.types';

interface UpdateAdminUserRolePayload {
  id: string;
  role: UserRole;
}

const updateAdminUserRole = async ({ id, role }: UpdateAdminUserRolePayload) => {
  const response = await api.patch<BaseResponse<Pick<AdminUserSummary, 'id' | 'username' | 'role'>>>(
    `/api/admin/users/${id}/role`,
    { role },
  );

  return response.data.data;
};

const useUpdateAdminUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdminUserRole,
    onError: useErrorHandler,
    onSuccess: (user) => {
      toaster.success({
        title: `${user.username} is now ${user.role === UserRole.Admin ? 'an admin' : 'a regular user'}.`,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUser(user.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminOverview });
    },
  });
};

export default useUpdateAdminUserRole;
