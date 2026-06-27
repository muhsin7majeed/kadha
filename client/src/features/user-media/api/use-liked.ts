import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { UserMedia } from '@/types/user-media';
import { useQuery } from '@tanstack/react-query';

const fetchLiked = async () => {
  const response = await api.get<BaseResponse<UserMedia[]>>('/api/user/liked');
  return response.data.data;
};

const useLiked = () => {
  return useQuery({
    queryKey: queryKeys.liked,
    queryFn: () => fetchLiked(),
  });
};

export default useLiked;
