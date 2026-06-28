import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { UserMedia } from '@/features/user-media/user-media.types';
import { useQuery } from '@tanstack/react-query';

import { UserMediaAccessResponse } from './use-watched';

const fetchWatchList = async (username?: string): Promise<UserMediaAccessResponse> => {
  const response = await api.get<UserMediaAccessResponse | BaseResponse<UserMedia[]>>(
    username ? `/api/users/${username}/watchlist` : '/api/user/watchlist',
  );

  return 'canView' in response.data ? response.data : { data: response.data.data, canView: true };
};

const useWatchList = (username?: string, options: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: username ? queryKeys.userWatchList(username) : queryKeys.watchList,
    queryFn: () => fetchWatchList(username),
    enabled: options.enabled ?? true,
  });
};

export default useWatchList;
