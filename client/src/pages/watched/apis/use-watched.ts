import api from '@/lib/axios-instance';
import { useQuery } from '@tanstack/react-query';
import { UserMedia } from '@/types/user-media';
import { BaseResponse } from '@/types/common';

const fetchWatched = async () => {
  const response = await api.get<BaseResponse<UserMedia[]>>('/api/user/watched');
  return response.data.data;
};

const useWatched = () => {
  return useQuery({
    queryKey: ['watched'],
    queryFn: () => fetchWatched(),
  });
};

export default useWatched;
