import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { useQuery } from '@tanstack/react-query';

import { UserMediaAccessResponse } from './use-watched';

const fetchLiked = async (username?: string, page = 1): Promise<UserMediaAccessResponse> => {
  const response = await api.get<UserMediaAccessResponse>(
    username ? `/api/users/${username}/liked` : '/api/user/liked',
    { params: { page } },
  );

  return response.data;
};

const useLiked = (username?: string, options: { enabled?: boolean; page?: number } = {}) => {
  const page = options.page ?? 1;

  return useQuery({
    queryKey: username ? queryKeys.userLiked(username, page) : [...queryKeys.liked, page],
    queryFn: () => fetchLiked(username, page),
    enabled: options.enabled ?? true,
  });
};

export default useLiked;
