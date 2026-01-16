import { useMutation } from '@tanstack/react-query';

import { useErrorHandler } from '@/hooks/useErrorHandler';
import api from '@/lib/axiosInstance';
import { toaster } from '@/components/ui/toaster';
import { Media } from '@/types/media';

const addToLiked = async (payload: Media) => {
  const response = await api.post(`/api/user-media/liked`, payload);
  return response.data;
};

const useAddToLiked = () => {
  return useMutation<unknown, Error, Media>({
    mutationFn: (payload: Media) => addToLiked(payload),
    onError: useErrorHandler,
    onSuccess: () => {
      toaster.success({
        title: 'Added to liked',
      });
    },
  });
};

export default useAddToLiked;
