import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { MovieWithMeta, TvWithMeta } from '@/types/media';

const fetchSearchMedia = async (query: string) => {
  const response = await api.get<{ media: MovieWithMeta[] | TvWithMeta[] }>(`/api/media/search/${query}`);
  return response.data.media;
};

const useSearchMedia = (query: string) => {
  return useQuery({
    queryKey: ['search-media', query],
    queryFn: () => fetchSearchMedia(query),
    enabled: !!query,
  });
};

export default useSearchMedia;
