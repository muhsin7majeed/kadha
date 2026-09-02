import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { RecommendationSettings } from '@/features/recommendations/recommendations.types';

const fetchRecommendationSettings = async () => {
  const response = await api.get<{ data: RecommendationSettings }>('/api/recommendations/settings');
  return response.data.data;
};

const useRecommendationSettings = () => {
  return useQuery({
    queryKey: queryKeys.recommendationSettings,
    queryFn: fetchRecommendationSettings,
    staleTime: 1000 * 60 * 5,
  });
};

export default useRecommendationSettings;
