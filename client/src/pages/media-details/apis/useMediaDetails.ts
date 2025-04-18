import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { MediaDetails, MediaType } from '@/types/media';

const fetchMediaDetails = async (mediaType: MediaType, id: string) => {
  const response = await api.get<{ media: MediaDetails }>(`/api/media/${mediaType}/${id}`);
  return response.data.media;
};

const useMediaDetails = (mediaType: MediaType, id: string) => {
  return useQuery({
    queryKey: ['media-details'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: () => fetchMediaDetails(mediaType, id),
  });
};

export default useMediaDetails;
