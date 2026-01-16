import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { Media } from '@/types/media';
import { BaseResponse } from '@/types/common';

const fetchTrendingMovies = async () => {
  const response = await api.get<BaseResponse<Media[]>>('/api/media/trending-movies');
  return response.data.data;
};

const useTrendingMovies = () => {
  return useQuery({
    queryKey: ['trending-movies'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: () => fetchTrendingMovies(),
  });
};

export default useTrendingMovies;
