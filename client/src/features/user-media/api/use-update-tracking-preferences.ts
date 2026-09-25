import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { BaseResponse } from '@/types/common';
import type { TrackingPreferences } from '../user-media.types';

interface UpdateTrackingPreferencesContext {
  previousPreferences?: TrackingPreferences;
}

const useUpdateTrackingPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation<TrackingPreferences, unknown, TrackingPreferences, UpdateTrackingPreferencesContext>({
    mutationFn: async (preferences) => {
      const response = await api.put<BaseResponse<TrackingPreferences>>(
        '/api/user-media/tracking-preferences',
        preferences,
      );
      return response.data.data;
    },
    onMutate: () => ({
      previousPreferences: queryClient.getQueryData<TrackingPreferences>(queryKeys.trackingPreferences),
    }),
    onError: useErrorHandler,
    onSuccess: async (preferences, _variables, context) => {
      queryClient.setQueryData(queryKeys.trackingPreferences, preferences);

      if (
        !context.previousPreferences ||
        context.previousPreferences.hideCaughtUpWithoutScheduledNext !==
          preferences.hideCaughtUpWithoutScheduledNext
      ) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.inProgressTvRoot });
      }
    },
  });
};

export default useUpdateTrackingPreferences;
