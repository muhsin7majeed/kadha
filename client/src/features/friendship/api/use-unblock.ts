import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import invalidateFriendshipQueries from './invalidate-friendship-queries';

const unblockUser = async (userId: string) => {
  const response = await api.post(`/api/friendship/unblock-user`, { userId });
  return response.data;
};

const useUnblock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      invalidateFriendshipQueries(queryClient);

      toaster.success({
        title: 'User unblocked',
      });
    },
    onError: useErrorHandler,
  });
};

export default useUnblock;
