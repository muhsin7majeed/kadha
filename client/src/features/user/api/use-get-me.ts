import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { User } from '@/types/user';

export const getMe = async (): Promise<User> => {
  const response = await api.get('/api/user/me');
  return response.data as User;
};

interface UseGetMeProps {
  enabled?: boolean;
}

export const useGetMe = ({ enabled }: UseGetMeProps = {}) => {
  return useQuery({
    queryKey: queryKeys.me,
    staleTime: Infinity,
    queryFn: () => getMe(),
    enabled,
    retry: false,
  });
};
