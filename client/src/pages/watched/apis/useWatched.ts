import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { Media } from '@/types/media';
import { BaseResponse } from '@/types/common';

const fetchWatched = async () => {
  const response = await api.get<BaseResponse<Media[]>>('/api/user/watched');
  return response.data.data;
};

const useWatched = () => {
  return useQuery({
    queryKey: ['watched'],
    queryFn: () => fetchWatched(),
  });
};

export default useWatched;
