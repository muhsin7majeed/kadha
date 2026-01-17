import api from '@/lib/axios-instance';
import { useQuery } from '@tanstack/react-query';
import { UserMedia } from '@/types/user-media';
import { BaseResponse } from '@/types/common';

const fetchWatchList = async () => {
  const response = await api.get<BaseResponse<UserMedia[]>>('/api/user/watchlist');
  return response.data.data;
};

const useWatchList = () => {
  return useQuery({
    queryKey: ['watch-list'],
    queryFn: () => fetchWatchList(),
  });
};

export default useWatchList;
