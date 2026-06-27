import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { MovieWithMeta, TvWithMeta } from '@/types/media';
import { useQuery } from '@tanstack/react-query';

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
