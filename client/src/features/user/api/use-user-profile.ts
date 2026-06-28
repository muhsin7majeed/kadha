import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { UserProfileResponse } from '@/features/user/user.types';

const fetchUserProfile = async (username: string) => {
  const response = await api.get<UserProfileResponse>(`/api/users/${username}/profile`);
  return response.data;
};

const useUserProfile = (username: string) => {
  return useQuery({
    queryKey: queryKeys.userProfile(username),
    queryFn: () => fetchUserProfile(username),
    enabled: !!username,
  });
};

export default useUserProfile;
