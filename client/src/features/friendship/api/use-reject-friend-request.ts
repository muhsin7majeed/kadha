import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { useMutation } from '@tanstack/react-query';

const rejectFriendRequest = async (senderId: string) => {
  const response = await api.post(`/api/friendship/reject-friend-request`, { senderId });
  return response.data;
};

const useRejectFriendRequest = () => {
  return useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      toaster.success({
        title: 'Friend request rejected',
      });
    },
    onError: useErrorHandler,
  });
};

export default useRejectFriendRequest;
