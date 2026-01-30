import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios-instance';
import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';

const sendFriendRequest = async (userId: string) => {
  const response = await api.post(`/api/friendship/send-friend-request`, { receiverId: userId });
  return response.data;
};

const useSendFriendRequest = () => {
  return useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      toaster.success({
        title: 'Friend request sent successfully',
      });
    },
    onError: useErrorHandler,
  });
};

export default useSendFriendRequest;
