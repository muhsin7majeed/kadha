import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { Media } from '@/types/media';
import { BaseResponse } from '@/types/common';

const fetchPopularMovies = async () => {
  const response = await api.get<BaseResponse<Media[]>>('/api/media/popular-movies');
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
