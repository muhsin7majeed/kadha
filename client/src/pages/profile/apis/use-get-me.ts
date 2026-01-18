import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios-instance';
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
    retry: false
  });
};
