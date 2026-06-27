import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import invalidateFriendshipQueries from './invalidate-friendship-queries';

const rejectFriendRequest = async (senderId: string) => {
  const response = await api.post(`/api/friendship/reject-friend-request`, { senderId });
  return response.data;
};

const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      invalidateFriendshipQueries(queryClient);

      toaster.success({
        title: 'Friend request rejected',
      });
    },
    onError: useErrorHandler,
  });
};

export default useRejectFriendRequest;
