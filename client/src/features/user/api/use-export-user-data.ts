import { useMutation } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster-store';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import type { ExportCategory } from '@/features/user/user-import.types';

const fallbackFilename = 'kadha-export.json';

const getFilenameFromContentDisposition = (contentDisposition?: string) => {
  if (!contentDisposition) {
    return fallbackFilename;
  }

  const filenameMatch = /filename="?(?<filename>[^";]+)"?/i.exec(contentDisposition);

  return filenameMatch?.groups?.filename ?? fallbackFilename;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const exportUserData = async (categories: ExportCategory[] | void) => {
  const response = await api.get<Blob>('/api/user/export', {
    params: categories ? { categories: categories.join(',') } : undefined,
    responseType: 'blob',
  });
  const filename = getFilenameFromContentDisposition(response.headers['content-disposition']);

  downloadBlob(response.data, filename);
};

const useExportUserData = () => {
  return useMutation<void, unknown, ExportCategory[] | void>({
    mutationFn: exportUserData,
    onError: useErrorHandler,
    onSuccess: () => {
      toaster.success({
        title: 'Account export downloaded',
      });
    },
  });
};

export default useExportUserData;
