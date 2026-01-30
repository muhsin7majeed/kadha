import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios-instance';
import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';

const unblockUser = async (userId: string) => {
  const response = await api.post(`/api/friendship/unblock-user`, { userId });
  return response.data;
};

const useUnblock = () => {
  return useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      toaster.success({
        title: 'User unblocked',
      });
    },
    onError: useErrorHandler,
  });
};

export default useUnblock;
