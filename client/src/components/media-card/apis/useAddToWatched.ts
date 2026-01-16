import { useMutation } from '@tanstack/react-query';

import { useErrorHandler } from '@/hooks/useErrorHandler';
import api from '@/lib/axiosInstance';
import { toaster } from '@/components/ui/toaster';
import { Media } from '@/types/media';

const addToWatched = async (payload: Media) => {
  const response = await api.post(`/api/user-media/watched`, payload);
  return response.data;
};

const useAddToWatched = () => {
  return useMutation<unknown, Error, Media>({
    mutationFn: (payload: Media) => addToWatched(payload),
    onError: useErrorHandler,
    onSuccess: () => {
      toaster.success({
        title: 'Added to watched',
      });
    },
  });
};

export default useAddToWatched;
