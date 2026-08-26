import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse, MediaType } from '@/types/common';
import type { MovieDetailsWithMeta, TvDetailsWithMeta } from '@/features/media/media.types';
import { useQuery } from '@tanstack/react-query';

const fetchMediaDetails = async (mediaType: MediaType, id: string, publicRead = false) => {
  const response = await api.get<BaseResponse<MovieDetailsWithMeta | TvDetailsWithMeta>>(
    `${publicRead ? '/api/public' : '/api'}/media/${mediaType}/${id}`,
  );
  return response.data.data;
};

const useMediaDetails = (mediaType?: MediaType, id?: string, options: { publicRead?: boolean } = {}) => {
  return useQuery({
    queryKey: mediaType && id ? [...queryKeys.mediaDetailsById(mediaType, id), options.publicRead ? 'public' : 'app'] : queryKeys.mediaDetails,
    staleTime: 1000 * 60 * 5,
    queryFn: () => fetchMediaDetails(mediaType!, id!, options.publicRead),
    enabled: !!mediaType && !!id,
  });
};

export default useMediaDetails;
