import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { MovieWithMeta } from '@/types/media';
import { useQuery } from '@tanstack/react-query';

const fetchTrendingMovies = async () => {
  const response = await api.get<BaseResponse<MovieWithMeta[]>>('/api/media/trending-movies');
  return response.data.data;
};

const useTrendingMovies = () => {
  return useQuery({
    queryKey: queryKeys.trendingMovies,
    staleTime: 1000 * 60 * 5,
    queryFn: () => fetchTrendingMovies(),
  });
};

export default useTrendingMovies;
