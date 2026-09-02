import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster-store';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { RecommendationSettings } from '@/features/recommendations/recommendations.types';

const resetRecommendationFeedback = async () => {
  await api.post('/api/recommendations/feedback/reset');
};

const resetRecommendationSettings = async () => {
  const response = await api.post<{ data: RecommendationSettings }>('/api/recommendations/settings/reset');
  return response.data.data;
};

export const useResetRecommendationFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, void>({
    mutationFn: resetRecommendationFeedback,
    onError: useErrorHandler,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendationsRoot });
      toaster.success({ title: 'Recommendation feedback reset' });
    },
  });
};

export const useResetRecommendationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation<RecommendationSettings, unknown, void>({
    mutationFn: resetRecommendationSettings,
    onError: useErrorHandler,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendationSettings });
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendationsRoot });
      toaster.success({ title: 'Recommendation settings restored' });
    },
  });
};
