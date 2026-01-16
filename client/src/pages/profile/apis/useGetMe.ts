import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axiosInstance';
import { getStoredToken } from '@/lib/auth';
import { User } from '@/types/user';

export const getMe = async (): Promise<User> => {
  const response = await api.get('/api/user/me');
  return response.data as User;
};

export const useGetMe = () => {
  return useQuery({
    queryKey: ['me'],
    staleTime: Infinity,
    queryFn: () => getMe(),
    enabled: Boolean(getStoredToken()),
  });
};
