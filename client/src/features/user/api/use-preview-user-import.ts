import { useMutation } from '@tanstack/react-query';

import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import type { UserImportPayload, UserImportPreview } from '@/features/user/user-import.types';

const previewUserImport = async (payload: UserImportPayload) => {
  const response = await api.post<{ data: UserImportPreview }>('/api/user/import/preview', payload);
  return response.data.data;
};

const usePreviewUserImport = () => {
  return useMutation<UserImportPreview, unknown, UserImportPayload>({
    mutationFn: previewUserImport,
    onError: useErrorHandler,
  });
};

export default usePreviewUserImport;
