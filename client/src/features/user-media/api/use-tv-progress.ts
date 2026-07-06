import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { TvProgressResponse } from '../user-media.types';

interface TvProgressOptions {
  enabled?: boolean;
  seasonNumber?: number;
  includeSpecials?: boolean;
}

const fetchTvProgress = async (mediaId: number, options: TvProgressOptions = {}) => {
  const response = await api.get<BaseResponse<TvProgressResponse>>(`/api/user-media/tv/${mediaId}/progress`, {
    params: {
      ...(options.seasonNumber !== undefined ? { seasonNumber: options.seasonNumber } : {}),
      ...(options.includeSpecials ? { includeSpecials: true } : {}),
    },
  });

  return response.data.data;
};

const useTvProgress = (mediaId?: number, options: TvProgressOptions = {}) =>
  useQuery({
    queryKey: queryKeys.tvProgressByMedia(mediaId, options.seasonNumber, Boolean(options.includeSpecials)),
    queryFn: () => fetchTvProgress(mediaId!, options),
    enabled: Boolean(mediaId) && (options.enabled ?? true),
    staleTime: 1000 * 60,
  });

export default useTvProgress;
