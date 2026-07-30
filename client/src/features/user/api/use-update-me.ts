import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster-store';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { UpdateUserPayload } from '@/features/user/user.types';

interface UpdateMeResponse extends UpdateUserPayload {
  id: string;
  createdAt: string;
  updatedAt: string;
}

const updateMe = async (data: UpdateUserPayload) => {
  const response = await api.put<UpdateMeResponse>('/api/user/me', data);
  return response.data;
};

const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateMeResponse, unknown, UpdateUserPayload>({
    mutationFn: updateMe,
    onError: useErrorHandler,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.mediaWatchProviders });
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfiles });

      toaster.success({
        title: 'Settings updated successfully',
      });
    },
  });
};

export default useUpdateMe;
