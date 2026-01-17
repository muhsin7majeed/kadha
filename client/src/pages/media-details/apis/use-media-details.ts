import api from '@/lib/axios-instance';
import { useQuery } from '@tanstack/react-query';
import { MediaType } from '@/types/common';
import { BaseResponse } from '@/types/common';
import type { MovieDetails, TvDetails } from '@/types/media';

const fetchMediaDetails = async (mediaType: MediaType, id: string) => {
  const response = await api.get<BaseResponse<MovieDetails | TvDetails>>(`/api/media/${mediaType}/${id}`);
  return response.data.data;
};

const useMediaDetails = (mediaType: MediaType, id: string) => {
  return useQuery({
    queryKey: ['media-details', mediaType, id],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: () => fetchMediaDetails(mediaType, id),
    enabled: !!mediaType && !!id,
  });
};

export default useMediaDetails;
