import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { useMutation } from '@tanstack/react-query';

const acceptFriendRequest = async (senderId: string) => {
  const response = await api.post(`/api/friendship/accept-friend-request`, { senderId });
  return response.data;
};

const useAcceptFriendRequest = () => {
  return useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      toaster.success({
        title: 'Friend request accepted',
      });
    },
    onError: useErrorHandler,
  });
};

export default useAcceptFriendRequest;
