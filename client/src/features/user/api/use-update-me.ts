import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';

interface UpdateMePayload {
  username: string;
}

interface UpdateMeResponse {
  id: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

const updateMe = async (data: UpdateMePayload) => {
  const response = await api.put<UpdateMeResponse>('/api/user/me', data);
  return response.data;
};

const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateMeResponse, Error, UpdateMePayload>({
    mutationFn: (data: UpdateMePayload) => updateMe(data),
    onError: useErrorHandler,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me });

      toaster.success({
        title: 'Username updated successfully',
      });
    },
  });
};

export default useUpdateMe;
