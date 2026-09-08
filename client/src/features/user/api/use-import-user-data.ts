import { useMutation } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster-store';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { queryClient } from '@/lib/query-client';
import api from '@/lib/axios-instance';
import type { UserImportPayload, UserImportSummary } from '@/features/user/user-import.types';

const importUserData = async (payload: UserImportPayload) => {
  const response = await api.post<{ data: UserImportSummary }>('/api/user/import', payload);
  return response.data.data;
};

const useImportUserData = () => {
  return useMutation<UserImportSummary, unknown, UserImportPayload>({
    mutationFn: importUserData,
    onError: useErrorHandler,
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toaster.success({ title: 'Import complete' });
    },
  });
};

export default useImportUserData;
