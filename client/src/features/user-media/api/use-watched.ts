import axios from 'axios';

import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { PaginatedResponse, ResourceAccessResponse } from '@/types/common';
import { UserMedia } from '@/features/user-media/user-media.types';
import { useQuery } from '@tanstack/react-query';

export type UserMediaAccessResponse = ResourceAccessResponse<UserMedia[]> & Partial<PaginatedResponse<UserMedia[]>>;

export const getAccessResponseFromError = <T>(error: unknown) => {
  if (axios.isAxiosError<T>(error) && error.response?.status === 403 && error.response.data) {
    return error.response.data;
  }

  throw error;
};

const fetchWatched = async (username?: string, page = 1): Promise<UserMediaAccessResponse> => {
  try {
    const response = await api.get<UserMediaAccessResponse>(
      username ? `/api/public/users/${username}/watched` : '/api/user/watched',
      { params: { page } },
    );

    return response.data;
  } catch (error) {
    return getAccessResponseFromError<UserMediaAccessResponse>(error);
  }
};

const useWatched = (username?: string, options: { enabled?: boolean; page?: number } = {}) => {
  const page = options.page ?? 1;

  return useQuery({
    queryKey: username ? queryKeys.userWatched(username, page) : [...queryKeys.watched, page],
    queryFn: () => fetchWatched(username, page),
    enabled: options.enabled ?? true,
  });
};

export default useWatched;
