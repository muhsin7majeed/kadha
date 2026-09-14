import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toaster } from '@/components/ui/toaster-store';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { BaseResponse } from '@/types/common';
import type { Feedback, UpdateFeedbackInput } from '../feedback.types';

export default function useUpdateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateFeedbackInput) =>
      (await api.patch<BaseResponse<Feedback>>(`/api/admin/feedback/${id}`, input)).data.data,
    onSuccess: (_, input) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminFeedbackRoot });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminFeedbackItem(input.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.feedbackRoot });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      toaster.success({ title: 'Feedback updated' });
    },
    onError: useErrorHandler,
  });
}
