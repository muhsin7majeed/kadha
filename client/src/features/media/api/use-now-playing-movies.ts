import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { MovieWithMeta } from '@/features/media/media.types';
import { useQuery } from '@tanstack/react-query';

const fetchNowPlayingMovies = async () => {
  const response = await api.get<BaseResponse<MovieWithMeta[]>>('/api/media/now-playing-movies');
  return response.data.data;
};

const useNowPlayingMovies = () => {
  return useQuery({
    queryKey: queryKeys.nowPlayingMovies,
    staleTime: 1000 * 60 * 5,
    queryFn: () => fetchNowPlayingMovies(),
  });
};

export default useNowPlayingMovies;
