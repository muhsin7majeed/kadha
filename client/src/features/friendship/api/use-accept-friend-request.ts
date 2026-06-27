import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import invalidateFriendshipQueries from './invalidate-friendship-queries';

const acceptFriendRequest = async (senderId: string) => {
  const response = await api.post(`/api/friendship/accept-friend-request`, { senderId });
  return response.data;
};

const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      invalidateFriendshipQueries(queryClient);

      toaster.success({
        title: 'Friend request accepted',
      });
    },
    onError: useErrorHandler,
  });
};

export default useAcceptFriendRequest;
