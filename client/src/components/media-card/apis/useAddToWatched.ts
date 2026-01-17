import { useMutation } from '@tanstack/react-query';

import { useErrorHandler } from '@/hooks/useErrorHandler';
import api from '@/lib/axiosInstance';
import { toaster } from '@/components/ui/toaster';
import { MovieWithMeta, TvWithMeta } from '@/types/media';

const addToWatched = async (payload: MovieWithMeta | TvWithMeta) => {
  const response = await api.post(`/api/user-media/watched`, payload);
  return response.data;
};

const useAddToWatched = () => {
  return useMutation<unknown, Error, MovieWithMeta | TvWithMeta>({
    mutationFn: (payload: MovieWithMeta | TvWithMeta) => addToWatched(payload),
    onError: useErrorHandler,
    onSuccess: () => {
      toaster.success({
        title: 'Added to watched',
      });
    },
  });
};

export default useAddToWatched;
