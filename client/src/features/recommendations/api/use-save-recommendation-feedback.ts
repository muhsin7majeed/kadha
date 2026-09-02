import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster-store';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { RecommendationFeedbackPayload } from '@/features/recommendations/recommendations.types';

const saveRecommendationFeedback = async (payload: RecommendationFeedbackPayload) => {
  const response = await api.post('/api/recommendations/feedback', payload);
  return response.data;
};

const useSaveRecommendationFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, RecommendationFeedbackPayload>({
    mutationFn: saveRecommendationFeedback,
    onError: useErrorHandler,
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendationsRoot });
      const title =
        payload.type === 'MORE_LIKE_THIS'
          ? 'Recommendation tuned'
          : payload.type === 'LESS_LIKE_THIS'
            ? 'Recommendation reduced'
            : 'Recommendation hidden';

      toaster.success({ title });
    },
  });
};

export default useSaveRecommendationFeedback;
