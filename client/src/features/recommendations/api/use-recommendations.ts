import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { RecommendationListResponse } from '@/features/recommendations/recommendations.types';

const fetchRecommendations = async (page = 1, limit = 20) => {
  const response = await api.get<RecommendationListResponse>('/api/recommendations', { params: { page, limit } });
  return response.data;
};

const useRecommendations = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: queryKeys.recommendations(page, limit),
    queryFn: () => fetchRecommendations(page, limit),
    staleTime: 1000 * 60 * 5,
  });
};

export default useRecommendations;
