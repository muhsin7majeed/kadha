import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { PaginatedResponse } from '@/types/common';
import type { FeedbackSummary } from '../feedback.types';

export default function useFeedback(page: number) {
  return useQuery({
    queryKey: queryKeys.feedbackList(page),
    queryFn: async () => (await api.get<PaginatedResponse<FeedbackSummary[]>>('/api/feedback', { params: { page, limit: 10 } })).data,
  });
}
