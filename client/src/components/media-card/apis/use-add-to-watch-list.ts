import { useMutation } from '@tanstack/react-query';

import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { toaster } from '@/components/ui/toaster';
import { MovieWithMeta, TvWithMeta } from '@/types/media';
import { BaseInfoResponse } from '@/types/common';
import { capitalize } from '@/utils/capitalize';

const addToWatchList = async (payload: MovieWithMeta | TvWithMeta) => {
  const response = await api.post(`/api/user-media/watchlist`, payload);
  return response.data;
};

const useAddToWatchList = () => {
  return useMutation<BaseInfoResponse, Error, MovieWithMeta | TvWithMeta>({
    mutationFn: (payload: MovieWithMeta | TvWithMeta) => addToWatchList(payload),
    onError: useErrorHandler,
    onSuccess: (data) => {
      toaster.success({
        title: capitalize(data.message),
      });
    },
  });
};

export default useAddToWatchList;
