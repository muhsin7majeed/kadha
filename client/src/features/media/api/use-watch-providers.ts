import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse, MediaType } from '@/types/common';
import { WatchProvidersResponse } from '@/features/media/media.types';

const fetchWatchProviders = async (mediaType: MediaType, id: string, region?: string) => {
  const response = await api.get<BaseResponse<WatchProvidersResponse>>(
    `/api/media/${mediaType}/${id}/watch-providers`,
    {
      params: region ? { region } : undefined,
    },
  );

  return response.data.data;
};

const useWatchProviders = (mediaType: MediaType, id: string, region?: string) => {
  return useQuery({
    queryKey: queryKeys.mediaWatchProvidersByRegion(mediaType, id, region),
    queryFn: () => fetchWatchProviders(mediaType, id, region),
    enabled: !!mediaType && !!id && !!region,
    staleTime: 1000 * 60 * 30,
  });
};

export default useWatchProviders;
