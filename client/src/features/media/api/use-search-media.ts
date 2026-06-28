import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { PaginatedResponse } from '@/types/common';
import { MovieWithMeta, TvWithMeta } from '@/features/media/media.types';
import { useQuery } from '@tanstack/react-query';
import { MediaType } from '@/types/common';

const fetchSearchMedia = async (mediaType: MediaType, query: string, page: number) => {
  const response = await api.get<PaginatedResponse<(MovieWithMeta | TvWithMeta)[]>>(
    `/api/media/search/${mediaType}/${encodeURIComponent(query)}`,
    {
      params: { page },
    },
  );
  return response.data;
};

const useSearchMedia = (mediaType: MediaType, query: string, page = 1, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.searchMediaByQuery(mediaType, query, page),
    queryFn: () => fetchSearchMedia(mediaType, query, page),
    enabled: enabled && !!query,
  });
};

export default useSearchMedia;
