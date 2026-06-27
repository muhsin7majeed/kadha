import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { BaseInfoResponse } from '@/types/common';
import { MovieWithMeta, TvWithMeta } from '@/types/media';
import { capitalize } from '@/utils/capitalize';
import { invalidateMediaActionQueries } from './invalidate-media-action-queries';

const addToLiked = async (payload: MovieWithMeta | TvWithMeta) => {
  const response = await api.post(`/api/user-media/liked`, payload);
  return response.data;
};

const useAddToLiked = () => {
  const queryClient = useQueryClient();

  return useMutation<BaseInfoResponse, Error, MovieWithMeta | TvWithMeta>({
    mutationFn: (payload: MovieWithMeta | TvWithMeta) => addToLiked(payload),
    onError: useErrorHandler,
    onSuccess: (data) => {
      invalidateMediaActionQueries(queryClient, 'liked');

      toaster.success({
        title: capitalize(data.message),
      });
    },
  });
};

export default useAddToLiked;
