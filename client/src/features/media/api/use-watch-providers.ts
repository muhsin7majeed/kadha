import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse, MediaType } from '@/types/common';
import { WatchProvidersResponse } from '@/features/media/media.types';

const fetchWatchProviders = async (mediaType: MediaType, id: string, region?: string, publicRead = false) => {
  const response = await api.get<BaseResponse<WatchProvidersResponse>>(
    `${publicRead ? '/api/public' : '/api'}/media/${mediaType}/${id}/watch-providers`,
    {
      params: region ? { region } : undefined,
    },
  );

  return response.data.data;
};

const useWatchProviders = (mediaType: MediaType, id: string, region?: string, options: { publicRead?: boolean } = {}) => {
  return useQuery({
    queryKey: [...queryKeys.mediaWatchProvidersByRegion(mediaType, id, region), options.publicRead ? 'public' : 'app'],
    queryFn: () => fetchWatchProviders(mediaType, id, region, options.publicRead),
    enabled: !!mediaType && !!id && !!region,
    staleTime: 1000 * 60 * 30,
  });
};

export default useWatchProviders;
