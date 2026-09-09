import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster-store';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { NavigationPreferences } from '@/features/navigation/navigation.types';

const updateNavigationPreferences = async (payload: NavigationPreferences) => {
  const response = await api.put<{ data: NavigationPreferences }>('/api/navigation-preferences', payload);
  return response.data.data;
};

const useUpdateNavigationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation<NavigationPreferences, unknown, NavigationPreferences>({
    mutationFn: updateNavigationPreferences,
    onError: useErrorHandler,
    onSuccess: (preferences) => {
      queryClient.setQueryData(queryKeys.navigationPreferences, preferences);
      toaster.success({ title: 'Navigation settings updated' });
    },
  });
};

export default useUpdateNavigationPreferences;
