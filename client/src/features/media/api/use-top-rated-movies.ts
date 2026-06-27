import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { MovieWithMeta } from '@/features/media/media.types';
import { useQuery } from '@tanstack/react-query';

const fetchTopRatedMovies = async () => {
  const response = await api.get<BaseResponse<MovieWithMeta[]>>('/api/media/top-rated-movies');
  return response.data.data;
};

const useTopRatedMovies = () => {
  return useQuery({
    queryKey: queryKeys.topRatedMovies,
    staleTime: 1000 * 60 * 5,
    queryFn: () => fetchTopRatedMovies(),
  });
};

export default useTopRatedMovies;
