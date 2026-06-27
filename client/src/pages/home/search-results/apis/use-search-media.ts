import api from '@/lib/axios-instance';
import { useQuery } from '@tanstack/react-query';
import { MovieWithMeta, TvWithMeta } from '@/types/media';
import { BaseResponse } from '@/types/common';
import { queryKeys } from '@/lib/query-keys';

const fetchSearchMedia = async (query: string) => {
  const response = await api.get<BaseResponse<MovieWithMeta[] | TvWithMeta[]>>(`/api/media/search/${query}`);
  return response.data.data;
};

const useSearchMedia = (query: string) => {
  return useQuery({
    queryKey: queryKeys.searchMediaByQuery(query),
    queryFn: () => fetchSearchMedia(query),
    enabled: !!query,
  });
};

export default useSearchMedia;
