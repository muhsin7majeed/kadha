import api from '@/lib/axios-instance';
import { useQuery } from '@tanstack/react-query';
import { UserMedia } from '@/types/user-media';
import { BaseResponse } from '@/types/common';
import { queryKeys } from '@/lib/query-keys';

const fetchWatchList = async () => {
  const response = await api.get<BaseResponse<UserMedia[]>>('/api/user/watchlist');
  return response.data.data;
};

const useWatchList = () => {
  return useQuery({
    queryKey: queryKeys.watchList,
    queryFn: () => fetchWatchList(),
  });
};

export default useWatchList;
