import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster-store';
import { useErrorHandler as handleApiError } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { BaseResponse, MediaType } from '@/types/common';
import type { CreateWatchEventPayload, UpdateWatchEventPayload, WatchHistory } from '../user-media.types';

interface WatchEventMutationIdentity {
  mediaId: number;
  mediaType: MediaType;
}

interface UpdateWatchEventVariables {
  eventId: string;
  payload: UpdateWatchEventPayload;
}

const invalidateWatchHistoryDependents = (
  queryClient: ReturnType<typeof useQueryClient>,
  identity: WatchEventMutationIdentity,
) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.mediaDetails }),
    queryClient.invalidateQueries({ queryKey: queryKeys.watched }),
    queryClient.invalidateQueries({ queryKey: queryKeys.watchList }),
    queryClient.invalidateQueries({ queryKey: queryKeys.userWatchedRoot }),
    queryClient.invalidateQueries({ queryKey: queryKeys.userWatchListRoot }),
    queryClient.invalidateQueries({ queryKey: queryKeys.viewingInsightsRoot }),
    queryClient.invalidateQueries({ queryKey: queryKeys.searchMedia }),
    queryClient.invalidateQueries({ queryKey: queryKeys.trendingMovies }),
    queryClient.invalidateQueries({ queryKey: queryKeys.popularMovies }),
    queryClient.invalidateQueries({ queryKey: queryKeys.topRatedMovies }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.mediaDetailsById(identity.mediaType, String(identity.mediaId)),
    }),
  ]);

const useWatchHistorySuccess = (identity: WatchEventMutationIdentity) => {
  const queryClient = useQueryClient();

  return async (history: WatchHistory) => {
    queryClient.setQueryData(queryKeys.watchEventsByMedia(identity.mediaType, identity.mediaId), history);
    await invalidateWatchHistoryDependents(queryClient, identity);
  };
};

export const useCreateWatchEvent = (identity: WatchEventMutationIdentity) => {
  const handleSuccess = useWatchHistorySuccess(identity);

  return useMutation({
    mutationFn: async (payload: CreateWatchEventPayload) => {
      const response = await api.post<BaseResponse<WatchHistory>>('/api/user-media/watch-events', payload);
      return response.data.data;
    },
    onError: handleApiError,
    onSuccess: async (history) => {
      await handleSuccess(history);
      toaster.success({ title: history.watchCount === 1 ? 'Marked watched' : 'Rewatch logged' });
    },
  });
};

export const useUpdateWatchEvent = (identity: WatchEventMutationIdentity) => {
  const handleSuccess = useWatchHistorySuccess(identity);

  return useMutation({
    mutationFn: async ({ eventId, payload }: UpdateWatchEventVariables) => {
      const response = await api.patch<BaseResponse<WatchHistory>>(`/api/user-media/watch-events/${eventId}`, payload);
      return response.data.data;
    },
    onError: handleApiError,
    onSuccess: async (history) => {
      await handleSuccess(history);
      toaster.success({ title: 'Watch updated' });
    },
  });
};

export const useDeleteWatchEvent = (identity: WatchEventMutationIdentity) => {
  const handleSuccess = useWatchHistorySuccess(identity);

  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await api.delete<BaseResponse<WatchHistory>>(`/api/user-media/watch-events/${eventId}`);
      return response.data.data;
    },
    onError: handleApiError,
    onSuccess: async (history) => {
      await handleSuccess(history);
      toaster.success({ title: 'Watch removed' });
    },
  });
};
