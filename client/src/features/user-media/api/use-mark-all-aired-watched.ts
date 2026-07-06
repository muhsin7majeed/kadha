import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster-store';
import { useErrorHandler as handleApiError } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { BaseResponse } from '@/types/common';
import { TvProgressResponse } from '../user-media.types';
import invalidateTvProgress from './invalidate-tv-progress';

const markAllAiredWatched = async (mediaId: number) => {
  const response = await api.post<BaseResponse<TvProgressResponse>>(
    `/api/user-media/tv/${mediaId}/mark-all-aired-watched`,
  );

  return response.data.data;
};

const useMarkAllAiredWatched = (mediaId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllAiredWatched(mediaId),
    onError: handleApiError,
    onSuccess: async () => {
      toaster.success({
        title: 'Marked all aired episodes watched',
      });
      await invalidateTvProgress(queryClient, mediaId);
    },
  });
};

export default useMarkAllAiredWatched;
