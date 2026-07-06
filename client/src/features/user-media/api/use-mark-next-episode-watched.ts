import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster-store';
import { useErrorHandler as handleApiError } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { BaseResponse } from '@/types/common';
import { TvProgressResponse } from '../user-media.types';
import invalidateTvProgress from './invalidate-tv-progress';

const markNextEpisodeWatched = async (mediaId: number) => {
  const response = await api.post<BaseResponse<TvProgressResponse>>(
    `/api/user-media/tv/${mediaId}/mark-next-episode-watched`,
  );

  return response.data.data;
};

const useMarkNextEpisodeWatched = (mediaId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markNextEpisodeWatched(mediaId),
    onError: handleApiError,
    onSuccess: async (progress) => {
      toaster.success({
        title: progress.selectedSeason
          ? 'Marked next episode watched'
          : progress.nextEpisode
            ? 'Episode progress updated'
            : 'You are caught up',
      });
      await invalidateTvProgress(queryClient, mediaId);
    },
  });
};

export default useMarkNextEpisodeWatched;
