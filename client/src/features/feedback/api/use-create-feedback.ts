import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toaster } from '@/components/ui/toaster-store';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { BaseResponse } from '@/types/common';
import type { CreateFeedbackInput, FeedbackSummary } from '../feedback.types';

export default function useCreateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateFeedbackInput) =>
      (await api.post<BaseResponse<FeedbackSummary>>('/api/feedback', input)).data.data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.feedbackRoot });
      toaster.success({ title: 'Feedback sent' });
    },
    onError: useErrorHandler,
  });
}
