import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import invalidateFriendshipQueries from './invalidate-friendship-queries';

const unfriend = async (userId: string) => {
  const response = await api.post(`/api/friendship/unfriend`, { userId });
  return response.data;
};

const useUnfriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfriend,
    onSuccess: () => {
      invalidateFriendshipQueries(queryClient);

      toaster.success({
        title: 'Friend removed',
      });
    },
    onError: useErrorHandler,
  });
};

export default useUnfriend;
