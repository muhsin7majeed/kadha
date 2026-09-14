import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { PaginatedResponse } from '@/types/common';
import type { AdminFeedbackParams, FeedbackSummary } from '../feedback.types';

export default function useAdminFeedback(params: AdminFeedbackParams) {
  const { category, status, ...rest } = params;
  return useQuery({
    queryKey: queryKeys.adminFeedbackList(params),
    queryFn: async () =>
      (await api.get<PaginatedResponse<FeedbackSummary[]>>('/api/admin/feedback', {
        params: { ...rest, ...(category === 'ALL' ? {} : { category }), ...(status === 'ALL' ? {} : { status }) },
      })).data,
  });
}
