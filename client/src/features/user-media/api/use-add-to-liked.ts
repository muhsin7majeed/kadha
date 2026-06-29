import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { BaseInfoResponse } from '@/types/common';
import { capitalize } from '@/utils/capitalize';
import { updateMediaActionCache } from './update-media-action-cache';
import { UserMediaPayload } from '../user-media.types';

const addToLiked = async (payload: UserMediaPayload) => {
  const response = await api.post(`/api/user-media/liked`, payload);
  return response.data;
};

const useAddToLiked = () => {
  const queryClient = useQueryClient();

  return useMutation<BaseInfoResponse, Error, UserMediaPayload>({
    mutationFn: (payload: UserMediaPayload) => addToLiked(payload),
    onError: useErrorHandler,
    onSuccess: (data, payload) => {
      updateMediaActionCache(queryClient, 'liked', payload);

      toaster.success({
        title: capitalize(data.message),
      });
    },
  });
};

export default useAddToLiked;
