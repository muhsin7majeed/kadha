import { useMutation } from '@tanstack/react-query';

import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { toaster } from '@/components/ui/toaster';
import { MovieWithMeta, TvWithMeta } from '@/types/media';

const addToWatchList = async (payload: MovieWithMeta | TvWithMeta) => {
  const response = await api.post(`/api/user-media/watchlist`, payload);
  return response.data;
};

const useAddToWatchList = () => {
  return useMutation<unknown, Error, MovieWithMeta | TvWithMeta>({
    mutationFn: (payload: MovieWithMeta | TvWithMeta) => addToWatchList(payload),
    onError: useErrorHandler,
    onSuccess: () => {
      toaster.success({
        title: 'Added to watchlist',
      });
    },
  });
};

export default useAddToWatchList;
