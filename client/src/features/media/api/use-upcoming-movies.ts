import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { MovieWithMeta } from '@/features/media/media.types';
import { useQuery } from '@tanstack/react-query';

const fetchUpcomingMovies = async () => {
  const response = await api.get<BaseResponse<MovieWithMeta[]>>('/api/media/upcoming-movies');
  return response.data.data;
};

const useUpcomingMovies = () => {
  return useQuery({
    queryKey: queryKeys.upcomingMovies,
    staleTime: 1000 * 60 * 5,
    queryFn: () => fetchUpcomingMovies(),
  });
};

export default useUpcomingMovies;
