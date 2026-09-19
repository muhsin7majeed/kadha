import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { useQuery } from '@tanstack/react-query';
import { OwnerMediaQuery } from '@/features/user-media/user-media.types';
import { toOwnerMediaRequestParams } from './use-owner-media-query';

import { getAccessResponseFromError, UserMediaAccessResponse } from './use-watched';

const fetchLiked = async (username?: string, page = 1, ownerQuery?: OwnerMediaQuery): Promise<UserMediaAccessResponse> => {
  try {
    const response = await api.get<UserMediaAccessResponse>(
      username ? `/api/public/users/${username}/liked` : '/api/user/liked',
      { params: username ? { page } : ownerQuery ? toOwnerMediaRequestParams(ownerQuery) : { page } },
    );

    return response.data;
  } catch (error) {
    return getAccessResponseFromError<UserMediaAccessResponse>(error);
  }
};

const useLiked = (username?: string, options: { enabled?: boolean; page?: number; ownerQuery?: OwnerMediaQuery } = {}) => {
  const page = options.page ?? 1;
  const ownerQuery = options.ownerQuery;

  return useQuery({
    queryKey: username
      ? queryKeys.userLiked(username, page)
      : ownerQuery
        ? queryKeys.likedList(ownerQuery)
        : [...queryKeys.liked, page],
    queryFn: () => fetchLiked(username, page, ownerQuery),
    enabled: options.enabled ?? true,
    placeholderData: ownerQuery ? (previousData) => previousData : undefined,
  });
};

export default useLiked;
