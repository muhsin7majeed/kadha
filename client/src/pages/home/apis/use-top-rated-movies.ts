import api from '@/lib/axios-instance';
import { useQuery } from '@tanstack/react-query';
import { MovieWithMeta } from '@/types/media';
import { BaseResponse } from '@/types/common';
import { queryKeys } from '@/lib/query-keys';

const fetchTopRatedMovies = async () => {
  const response = await api.get<BaseResponse<MovieWithMeta[]>>('/api/media/top-rated-movies');
  return response.data.data;
};

const useTopRatedMovies = () => {
  return useQuery({
    queryKey: queryKeys.topRatedMovies,
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: () => fetchTopRatedMovies(),
  });
};

export default useTopRatedMovies;
