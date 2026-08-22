import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { BaseResponse, MediaType } from '@/types/common';
import type { WatchHistory } from '../user-media.types';

const fetchWatchEvents = async (mediaType: MediaType, mediaId: number) => {
  const response = await api.get<BaseResponse<WatchHistory>>(`/api/user-media/${mediaType}/${mediaId}/watch-events`);

  return response.data.data;
};

const useWatchEvents = (mediaType?: MediaType, mediaId?: number, enabled = true) =>
  useQuery({
    queryKey: queryKeys.watchEventsByMedia(mediaType, mediaId),
    queryFn: () => fetchWatchEvents(mediaType!, mediaId!),
    enabled: enabled && Boolean(mediaType && mediaId),
    staleTime: 1000 * 60,
  });

export default useWatchEvents;
