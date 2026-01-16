import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { Media } from '@/types/media';
import { BaseResponse } from '@/types/common';

const fetchTopRatedTvs = async () => {
  const response = await api.get<BaseResponse<Media[]>>('/api/media/top-rated-tvs');
  return response.data.data;
};

const useTopRatedTvs = () => {
  return useQuery({
    queryKey: ['top-rated-tvs'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: () => fetchTopRatedTvs(),
  });
};

export default useTopRatedTvs;
