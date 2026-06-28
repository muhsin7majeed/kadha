import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { BaseInfoResponse } from '@/types/common';
import { capitalize } from '@/utils/capitalize';
import { invalidateMediaActionQueries } from './invalidate-media-action-queries';
import { UserMediaPayload } from '../user-media.types';

const addToWatchList = async (payload: UserMediaPayload) => {
  const response = await api.post(`/api/user-media/watchlist`, payload);
  return response.data;
};

const useAddToWatchList = () => {
  const queryClient = useQueryClient();

  return useMutation<BaseInfoResponse, Error, UserMediaPayload>({
    mutationFn: (payload: UserMediaPayload) => addToWatchList(payload),
    onError: useErrorHandler,
    onSuccess: (data) => {
      invalidateMediaActionQueries(queryClient, 'watchlist');

      toaster.success({
        title: capitalize(data.message),
      });
    },
  });
};

export default useAddToWatchList;
