import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster-store';
import { useErrorHandler as handleApiError } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { BaseResponse } from '@/types/common';
import { TvProgressResponse } from '../user-media.types';
import invalidateTvProgress from './invalidate-tv-progress';

interface EpisodeWatchPayload {
  seasonNumber: number;
  episodeNumber: number;
  episodeId?: number | null;
  watched: boolean;
}

const updateEpisodeWatch = async (mediaId: number, payload: EpisodeWatchPayload) => {
  if (!payload.watched) {
    const response = await api.delete<BaseResponse<TvProgressResponse>>(
      `/api/user-media/tv/${mediaId}/episodes/${payload.seasonNumber}/${payload.episodeNumber}`,
    );

    return response.data.data;
  }

  const response = await api.post<BaseResponse<TvProgressResponse>>(`/api/user-media/tv/${mediaId}/episodes`, {
    seasonNumber: payload.seasonNumber,
    episodeNumber: payload.episodeNumber,
    episodeId: payload.episodeId,
  });

  return response.data.data;
};

const useUpdateEpisodeWatch = (mediaId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EpisodeWatchPayload) => updateEpisodeWatch(mediaId, payload),
    onError: handleApiError,
    onSuccess: async (_progress, payload) => {
      toaster.success({
        title: payload.watched ? 'Marked episode watched' : 'Cleared episode watch',
      });
      await invalidateTvProgress(queryClient, mediaId);
    },
  });
};

export default useUpdateEpisodeWatch;
