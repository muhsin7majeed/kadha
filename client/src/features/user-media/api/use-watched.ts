import axios from 'axios';

import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { PaginatedResponse, ResourceAccessResponse } from '@/types/common';
import { UserMedia } from '@/features/user-media/user-media.types';
import { OwnerMediaFacets, OwnerMediaQuery } from '@/features/user-media/user-media.types';
import { useQuery } from '@tanstack/react-query';
import { toOwnerMediaRequestParams } from './use-owner-media-query';

export type UserMediaAccessResponse = ResourceAccessResponse<UserMedia[]> &
  Partial<PaginatedResponse<UserMedia[]>> & { facets?: OwnerMediaFacets };

export const getAccessResponseFromError = <T>(error: unknown) => {
  if (axios.isAxiosError<T>(error) && error.response?.status === 403 && error.response.data) {
    return error.response.data;
  }

  throw error;
};

const fetchWatched = async (
  username?: string,
  page = 1,
  ownerQuery?: OwnerMediaQuery,
): Promise<UserMediaAccessResponse> => {
  try {
    const response = await api.get<UserMediaAccessResponse>(
      username ? `/api/public/users/${username}/watched` : '/api/user/watched',
      { params: username ? { page } : ownerQuery ? toOwnerMediaRequestParams(ownerQuery) : { page } },
    );

    return response.data;
  } catch (error) {
    return getAccessResponseFromError<UserMediaAccessResponse>(error);
  }
};

const useWatched = (
  username?: string,
  options: { enabled?: boolean; page?: number; ownerQuery?: OwnerMediaQuery } = {},
) => {
  const page = options.page ?? 1;
  const ownerQuery = options.ownerQuery;

  return useQuery({
    queryKey: username
      ? queryKeys.userWatched(username, page)
      : ownerQuery
        ? queryKeys.watchedList(ownerQuery)
        : [...queryKeys.watched, page],
    queryFn: () => fetchWatched(username, page, ownerQuery),
    enabled: options.enabled ?? true,
    placeholderData: ownerQuery ? (previousData) => previousData : undefined,
  });
};

export default useWatched;
