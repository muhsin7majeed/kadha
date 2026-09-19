import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster-store';
import type { HomePreferences } from '@/features/home/home.types';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';

const updateHomePreferences = async (payload: HomePreferences) => {
  const response = await api.put<{ data: HomePreferences }>('/api/home-preferences', payload);
  return response.data.data;
};

const useUpdateHomePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation<HomePreferences, unknown, HomePreferences>({
    mutationFn: updateHomePreferences,
    onError: useErrorHandler,
    onSuccess: (preferences) => {
      queryClient.setQueryData(queryKeys.homePreferences, preferences);
      toaster.success({ title: 'Home settings updated' });
    },
  });
};

export default useUpdateHomePreferences;
