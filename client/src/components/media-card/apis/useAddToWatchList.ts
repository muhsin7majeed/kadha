import { useMutation } from '@tanstack/react-query';

import { useErrorHandler } from '@/hooks/useErrorHandler';
import api from '@/lib/axiosInstance';
import { toaster } from '@/components/ui/toaster';
import { Media } from '@/types/media';

const addToWatchList = async (payload: Media) => {
  const response = await api.post(`/api/user-media/watchlist`, payload);
  return response.data;
};

const useAddToWatchList = () => {
  return useMutation<unknown, Error, Media>({
    mutationFn: (payload: Media) => addToWatchList(payload),
    onError: useErrorHandler,
    onSuccess: () => {
      toaster.success({
        title: 'Added to watchlist',
      });
    },
  });
};

export default useAddToWatchList;
