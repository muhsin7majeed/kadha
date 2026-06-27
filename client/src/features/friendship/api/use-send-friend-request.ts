import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import invalidateFriendshipQueries from './invalidate-friendship-queries';

const sendFriendRequest = async (userId: string) => {
  const response = await api.post(`/api/friendship/send-friend-request`, { receiverId: userId });
  return response.data;
};

const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      invalidateFriendshipQueries(queryClient);

      toaster.success({
        title: 'Friend request sent successfully',
      });
    },
    onError: useErrorHandler,
  });
};

export default useSendFriendRequest;
