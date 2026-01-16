import { useMutation } from '@tanstack/react-query';

import { useErrorHandler } from '@/hooks/useErrorHandler';
import api from '@/lib/axiosInstance';
import { toaster } from '@/components/ui/toaster';
import { UserMediaPayload } from '@/types/user-media';

const addToWatched = async (payload: UserMediaPayload) => {
  const response = await api.post(`/api/user-media/watched`, payload);
  return response.data;
};

const useAddToWatched = () => {
  return useMutation<unknown, Error, UserMediaPayload>({
    mutationFn: (payload: UserMediaPayload) => addToWatched(payload),
    onError: useErrorHandler,
    onSuccess: () => {
      toaster.success({
        title: 'Added to watched',
      });
    },
  });
};

export default useAddToWatched;
