import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { MediaType } from '@/types/media';
import { BaseResponse } from '@/types/common';
import type { MediaDetails } from '@/types/media';

const fetchMediaDetails = async (mediaType: MediaType, id: string) => {
  const response = await api.get<BaseResponse<MediaDetails>>(`/api/media/${mediaType}/${id}`);
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
