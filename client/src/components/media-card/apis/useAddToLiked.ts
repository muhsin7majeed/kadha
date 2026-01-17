import { useMutation } from '@tanstack/react-query';

import { useErrorHandler } from '@/hooks/useErrorHandler';
import api from '@/lib/axiosInstance';
import { toaster } from '@/components/ui/toaster';
import { MovieWithMeta, TvWithMeta } from '@/types/media';

const addToLiked = async (payload: MovieWithMeta | TvWithMeta) => {
  const response = await api.post(`/api/user-media/liked`, payload);
  return response.data;
};

const useAddToLiked = () => {
  return useMutation<unknown, Error, MovieWithMeta | TvWithMeta>({
    mutationFn: (payload: MovieWithMeta | TvWithMeta) => addToLiked(payload),
    onError: useErrorHandler,
    onSuccess: () => {
      toaster.success({
        title: 'Added to liked',
      });
    },
  });
};

export default useAddToLiked;
