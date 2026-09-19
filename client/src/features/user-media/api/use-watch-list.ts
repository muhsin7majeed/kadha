import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { useQuery } from '@tanstack/react-query';
import { OwnerMediaQuery } from '@/features/user-media/user-media.types';
import { toOwnerMediaRequestParams } from './use-owner-media-query';

import { getAccessResponseFromError, UserMediaAccessResponse } from './use-watched';

const fetchWatchList = async (
  username?: string,
  page = 1,
  ownerQuery?: OwnerMediaQuery,
): Promise<UserMediaAccessResponse> => {
  try {
    const response = await api.get<UserMediaAccessResponse>(
      username ? `/api/public/users/${username}/watchlist` : '/api/user/watchlist',
      { params: username ? { page } : ownerQuery ? toOwnerMediaRequestParams(ownerQuery) : { page } },
    );

    return response.data;
  } catch (error) {
    return getAccessResponseFromError<UserMediaAccessResponse>(error);
  }
};

const useWatchList = (
  username?: string,
  options: { enabled?: boolean; page?: number; ownerQuery?: OwnerMediaQuery } = {},
) => {
  const page = options.page ?? 1;
  const ownerQuery = options.ownerQuery;

  return useQuery({
    queryKey: username
      ? queryKeys.userWatchList(username, page)
      : ownerQuery
        ? queryKeys.watchListList(ownerQuery)
        : [...queryKeys.watchList, page],
    queryFn: () => fetchWatchList(username, page, ownerQuery),
    enabled: options.enabled ?? true,
    placeholderData: ownerQuery ? (previousData) => previousData : undefined,
  });
};

export default useWatchList;
