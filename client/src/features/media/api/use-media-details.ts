import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse, MediaType } from '@/types/common';
import type { MovieDetailsWithMeta, TvDetailsWithMeta } from '@/features/media/media.types';
import { useQuery } from '@tanstack/react-query';

const fetchMediaDetails = async (mediaType: MediaType, id: string) => {
  const response = await api.get<BaseResponse<MovieDetailsWithMeta | TvDetailsWithMeta>>(
    `/api/media/${mediaType}/${id}`,
  );
  return response.data.data;
};

const useMediaDetails = (mediaType: MediaType, id: string) => {
  return useQuery({
    queryKey: queryKeys.mediaDetailsById(mediaType, id),
    staleTime: 1000 * 60 * 5,
    queryFn: () => fetchMediaDetails(mediaType, id),
    enabled: !!mediaType && !!id,
  });
};

export default useMediaDetails;
