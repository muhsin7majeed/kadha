import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { Media } from '@/types/media';
import { BaseResponse } from '@/types/common';

const fetchWatchList = async () => {
  const response = await api.get<BaseResponse<Media[]>>('/api/user/watchlist');
  return response.data.data;
};

const useWatchList = () => {
  return useQuery({
    queryKey: ['watch-list'],
    queryFn: () => fetchWatchList(),
  });
};

export default useWatchList;
