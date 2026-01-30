import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios-instance';
import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';

const unfriend = async (userId: string) => {
  const response = await api.post(`/api/friendship/unfriend`, { userId });
  return response.data;
};

const useUnfriend = () => {
  return useMutation({
    mutationFn: unfriend,
    onSuccess: () => {
      toaster.success({
        title: 'Friend removed',
      });
    },
    onError: useErrorHandler,
  });
};

export default useUnfriend;
