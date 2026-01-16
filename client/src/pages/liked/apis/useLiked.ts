import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { Media } from '@/types/media';
import { BaseResponse } from '@/types/common';

const fetchLiked = async () => {
  const response = await api.get<BaseResponse<Media[]>>('/api/user/liked');
  return response.data.data;
};

const useLiked = () => {
  return useQuery({
    queryKey: ['liked'],
    queryFn: () => fetchLiked(),
  });
};

export default useLiked;
