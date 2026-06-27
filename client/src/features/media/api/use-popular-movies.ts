import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { MovieWithMeta } from '@/features/media/media.types';
import { useQuery } from '@tanstack/react-query';

const fetchPopularMovies = async () => {
  const response = await api.get<BaseResponse<MovieWithMeta[]>>('/api/media/popular-movies');
  return response.data.data;
};

const usePopularMovies = () => {
  return useQuery({
    queryKey: queryKeys.popularMovies,
    staleTime: 1000 * 60 * 5,
    queryFn: () => fetchPopularMovies(),
  });
};

export default usePopularMovies;
