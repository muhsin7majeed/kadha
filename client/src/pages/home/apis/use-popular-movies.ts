import api from '@/lib/axios-instance';
import { useQuery } from '@tanstack/react-query';
import { MovieWithMeta } from '@/types/media';
import { BaseResponse } from '@/types/common';

const fetchPopularMovies = async () => {
  const response = await api.get<BaseResponse<MovieWithMeta[]>>('/api/media/popular-movies');
  return response.data.data;
};

const usePopularMovies = () => {
  return useQuery({
    queryKey: ['popular-movies'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: () => fetchPopularMovies(),
  });
};

export default usePopularMovies;
