import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { UserMedia } from '@/features/user-media/user-media.types';
import { useQuery } from '@tanstack/react-query';

const fetchWatched = async () => {
  const response = await api.get<BaseResponse<UserMedia[]>>('/api/user/watched');
  return response.data.data;
};

const useWatched = () => {
  return useQuery({
    queryKey: queryKeys.watched,
    queryFn: () => fetchWatched(),
  });
};

export default useWatched;
