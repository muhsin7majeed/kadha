import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster-store';
import type { MediaCardPreferences } from '@/features/media-card-preferences/media-card-preferences.types';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';

const useUpdateMediaCardPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation<MediaCardPreferences, unknown, MediaCardPreferences>({
    mutationFn: async (preferences) => {
      const response = await api.put<{ data: MediaCardPreferences }>('/api/media-card-preferences', preferences);
      return response.data.data;
    },
    onError: useErrorHandler,
    onSuccess: (preferences) => {
      queryClient.setQueryData(queryKeys.mediaCardPreferences, preferences);
      toaster.success({ title: 'Card style updated' });
    },
  });
};

export default useUpdateMediaCardPreferences;
