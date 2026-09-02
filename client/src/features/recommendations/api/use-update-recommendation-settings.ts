import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster-store';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { RecommendationSettings } from '@/features/recommendations/recommendations.types';

const updateRecommendationSettings = async (payload: Partial<RecommendationSettings>) => {
  const response = await api.put<{ data: RecommendationSettings }>('/api/recommendations/settings', payload);
  return response.data.data;
};

const useUpdateRecommendationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation<RecommendationSettings, unknown, Partial<RecommendationSettings>>({
    mutationFn: updateRecommendationSettings,
    onError: useErrorHandler,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendationSettings });
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendationsRoot });
      toaster.success({ title: 'Recommendation settings updated' });
    },
  });
};

export default useUpdateRecommendationSettings;
