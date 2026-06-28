import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { UserMedia } from '@/features/user-media/user-media.types';
import { useQuery } from '@tanstack/react-query';

export interface UserMediaAccessResponse {
  data: UserMedia[];
  canView?: boolean;
  lockedReason?: 'PRIVATE' | 'FRIENDS_ONLY';
}

const fetchWatched = async (username?: string): Promise<UserMediaAccessResponse> => {
  const response = await api.get<UserMediaAccessResponse | BaseResponse<UserMedia[]>>(
    username ? `/api/users/${username}/watched` : '/api/user/watched',
  );

  return 'canView' in response.data ? response.data : { data: response.data.data, canView: true };
};

const useWatched = (username?: string, options: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: username ? queryKeys.userWatched(username) : queryKeys.watched,
    queryFn: () => fetchWatched(username),
    enabled: options.enabled ?? true,
  });
};

export default useWatched;
