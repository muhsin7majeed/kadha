import api from '@/lib/axios-instance';
import { useQuery } from '@tanstack/react-query';
import { UserMedia } from '@/types/user-media';
import { BaseResponse } from '@/types/common';

const fetchLiked = async () => {
  const response = await api.get<BaseResponse<UserMedia[]>>('/api/user/liked');
  return response.data.data;
};

const useLiked = () => {
  return useQuery({
    queryKey: ['liked'],
    queryFn: () => fetchLiked(),
  });
};

export default useLiked;
