import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { Media } from '@/types/media';
import { BaseResponse } from '@/types/common';

const fetchTopRatedMovies = async () => {
  const response = await api.get<BaseResponse<Media[]>>('/api/media/top-rated-movies');
  return response.data.data;
};

const useTopRatedMovies = () => {
  return useQuery({
    queryKey: ['top-rated-movies'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: () => fetchTopRatedMovies(),
  });
};

export default useTopRatedMovies;
