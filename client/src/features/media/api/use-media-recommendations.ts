import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { MediaType, PaginatedResponse } from '@/types/common';
import type { MovieWithMeta, TvWithMeta } from '@/features/media/media.types';
import { useQuery } from '@tanstack/react-query';

const fetchMediaRecommendations = async (mediaType: MediaType, id: string, page = 1) => {
  const response = await api.get<PaginatedResponse<MovieWithMeta[] | TvWithMeta[]>>(
    `/api/media/${mediaType}/${id}/recommendations`,
    { params: { page } },
  );
  return response.data;
};

const useMediaRecommendations = (mediaType?: MediaType, id?: string, page = 1) => {
  return useQuery({
    queryKey: mediaType && id ? queryKeys.mediaRecommendationsById(mediaType, id, page) : queryKeys.mediaRecommendations,
    staleTime: 1000 * 60 * 5,
    queryFn: () => fetchMediaRecommendations(mediaType!, id!, page),
    enabled: !!mediaType && !!id,
  });
};

export default useMediaRecommendations;
