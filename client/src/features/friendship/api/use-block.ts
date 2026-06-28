import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import invalidateFriendshipQueries from './invalidate-friendship-queries';

const blockUser = async (userId: string) => {
  const response = await api.post(`/api/friendship/block-user`, { userId });
  return response.data;
};

const useBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blockUser,
    onSuccess: () => {
      invalidateFriendshipQueries(queryClient);

      toaster.success({
        title: 'User blocked',
      });
    },
    onError: useErrorHandler,
  });
};

export default useBlock;
