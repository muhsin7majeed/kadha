import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { BaseResponse } from '@/types/common';
import type { Feedback } from '../feedback.types';

export default function useFeedbackItem(id?: string) {
  return useQuery({
    queryKey: queryKeys.feedbackItem(id),
    queryFn: async () => (await api.get<BaseResponse<Feedback>>(`/api/feedback/${id}`)).data.data,
    enabled: Boolean(id),
  });
}
