import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { BaseInfoResponse } from '@/types/common';
import { capitalize } from '@/utils/capitalize';
import { invalidateMediaActionQueries } from './invalidate-media-action-queries';
import { UserMediaPayload } from '../user-media.types';

const addToWatched = async (payload: UserMediaPayload) => {
  const response = await api.post(`/api/user-media/watched`, payload);
  return response.data;
};

const useAddToWatched = () => {
  const queryClient = useQueryClient();

  return useMutation<BaseInfoResponse, Error, UserMediaPayload>({
    mutationFn: (payload: UserMediaPayload) => addToWatched(payload),
    onError: useErrorHandler,
    onSuccess: (data) => {
      invalidateMediaActionQueries(queryClient, 'watched');

      toaster.success({
        title: capitalize(data.message),
      });
    },
  });
};

export default useAddToWatched;
