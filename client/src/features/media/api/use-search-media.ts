import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { PaginatedResponse } from '@/types/common';
import { MovieWithMeta, TvWithMeta } from '@/features/media/media.types';
import { useQuery } from '@tanstack/react-query';

const fetchSearchMedia = async (query: string, page: number) => {
  const response = await api.get<PaginatedResponse<MovieWithMeta[] | TvWithMeta[]>>(
    `/api/media/search/${encodeURIComponent(query)}`,
    {
      params: { page },
    },
  );
  return response.data;
};

const useSearchMedia = (query: string, page = 1) => {
  return useQuery({
    queryKey: queryKeys.searchMediaByQuery(query, page),
    queryFn: () => fetchSearchMedia(query, page),
    enabled: !!query,
  });
};

export default useSearchMedia;
