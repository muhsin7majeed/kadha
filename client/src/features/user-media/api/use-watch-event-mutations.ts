import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster-store';
import { useErrorHandler as handleApiError } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import type { BaseResponse } from '@/types/common';
import type { CreateWatchEventPayload, UpdateWatchEventPayload, WatchHistory } from '../user-media.types';
import invalidateWatchEventQueries, { type WatchEventIdentity } from './invalidate-watch-event-queries';

interface UpdateWatchEventVariables {
  eventId: string;
  payload: UpdateWatchEventPayload;
}

const useWatchHistorySuccess = (identity: WatchEventIdentity, changesWatchCount: boolean) => {
  const queryClient = useQueryClient();
  return () => invalidateWatchEventQueries(queryClient, identity, changesWatchCount);
};

export const useCreateWatchEvent = (identity: WatchEventIdentity) => {
  const handleSuccess = useWatchHistorySuccess(identity, true);

  return useMutation({
    mutationFn: async (payload: CreateWatchEventPayload) => {
      const response = await api.post<BaseResponse<WatchHistory>>('/api/user-media/watch-events', payload);
      return response.data.data;
    },
    onError: handleApiError,
    onSuccess: async (history) => {
      await handleSuccess();
      toaster.success({ title: history.watchCount === 1 ? 'Marked watched' : 'Rewatch logged' });
    },
  });
};

export const useUpdateWatchEvent = (identity: WatchEventIdentity) => {
  const handleSuccess = useWatchHistorySuccess(identity, false);

  return useMutation({
    mutationFn: async ({ eventId, payload }: UpdateWatchEventVariables) => {
      const response = await api.patch<BaseResponse<WatchHistory>>(`/api/user-media/watch-events/${eventId}`, payload);
      return response.data.data;
    },
    onError: handleApiError,
    onSuccess: async () => {
      await handleSuccess();
      toaster.success({ title: 'Watch updated' });
    },
  });
};

export const useDeleteWatchEvent = (identity: WatchEventIdentity) => {
  const handleSuccess = useWatchHistorySuccess(identity, true);

  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await api.delete<BaseResponse<WatchHistory>>(`/api/user-media/watch-events/${eventId}`);
      return response.data.data;
    },
    onError: handleApiError,
    onSuccess: async () => {
      await handleSuccess();
      toaster.success({ title: 'Watch removed' });
    },
  });
};
