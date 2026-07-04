import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster-store';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';

interface UpdateMePayload {
  username: string;
  profilePrivacy: string;
  watchedPrivacy: string;
  likedPrivacy: string;
  watchlistPrivacy: string;
  watchRegion: string;
}

interface UpdateMeResponse {
  id: string;
  username: string;
  profilePrivacy: string;
  watchedPrivacy: string;
  likedPrivacy: string;
  watchlistPrivacy: string;
  watchRegion: string;
  createdAt: Date;
  updatedAt: Date;
}

const updateMe = async (data: UpdateMePayload) => {
  const response = await api.put<UpdateMeResponse>('/api/user/me', data);
  return response.data;
};

const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateMeResponse, unknown, UpdateMePayload>({
    mutationFn: (data: UpdateMePayload) => updateMe(data),
    onError: useErrorHandler,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.mediaWatchProviders });

      toaster.success({
        title: 'Profile updated successfully',
      });
    },
  });
};

export default useUpdateMe;
