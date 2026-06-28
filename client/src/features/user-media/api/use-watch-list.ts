import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { useQuery } from '@tanstack/react-query';

import { UserMediaAccessResponse } from './use-watched';

const fetchWatchList = async (username?: string, page = 1): Promise<UserMediaAccessResponse> => {
  const response = await api.get<UserMediaAccessResponse>(
    username ? `/api/users/${username}/watchlist` : '/api/user/watchlist',
    { params: { page } },
  );

  return response.data;
};

const useWatchList = (username?: string, options: { enabled?: boolean; page?: number } = {}) => {
  const page = options.page ?? 1;

  return useQuery({
    queryKey: username ? queryKeys.userWatchList(username, page) : [...queryKeys.watchList, page],
    queryFn: () => fetchWatchList(username, page),
    enabled: options.enabled ?? true,
  });
};

export default useWatchList;
