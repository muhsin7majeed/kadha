import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster-store';
import { useErrorHandler as handleApiError } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { BaseResponse } from '@/types/common';
import { TvProgressResponse } from '../user-media.types';
import invalidateTvProgress from './invalidate-tv-progress';

interface SeasonWatchPayload {
  seasonNumber: number;
  watched: boolean;
}

const updateSeasonWatch = async (mediaId: number, payload: SeasonWatchPayload) => {
  const endpoint = `/api/user-media/tv/${mediaId}/seasons/${payload.seasonNumber}/watched`;
  const response = payload.watched
    ? await api.post<BaseResponse<TvProgressResponse>>(endpoint)
    : await api.delete<BaseResponse<TvProgressResponse>>(endpoint);

  return response.data.data;
};

const useUpdateSeasonWatch = (mediaId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SeasonWatchPayload) => updateSeasonWatch(mediaId, payload),
    onError: handleApiError,
    onSuccess: async (_progress, payload) => {
      toaster.success({
        title: payload.watched ? 'Marked season watched' : 'Cleared season progress',
      });
      await invalidateTvProgress(queryClient, mediaId);
    },
  });
};

export default useUpdateSeasonWatch;
