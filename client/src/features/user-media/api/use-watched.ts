import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { PaginatedResponse, ResourceAccessResponse } from '@/types/common';
import { UserMedia } from '@/features/user-media/user-media.types';
import { useQuery } from '@tanstack/react-query';

export type UserMediaAccessResponse = ResourceAccessResponse<UserMedia[]> & Partial<PaginatedResponse<UserMedia[]>>;

const fetchWatched = async (username?: string, page = 1): Promise<UserMediaAccessResponse> => {
  const response = await api.get<UserMediaAccessResponse>(
    username ? `/api/users/${username}/watched` : '/api/user/watched',
    { params: { page } },
  );

  return response.data;
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
