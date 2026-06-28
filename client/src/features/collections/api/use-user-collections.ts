import { useQuery } from '@tanstack/react-query';

import { CollectionDetails } from '@/features/collections/collections.types';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';

interface UserCollectionsResponse {
  data: CollectionDetails[];
  canView: boolean;
  lockedReason?: 'PRIVATE' | 'FRIENDS_ONLY';
}

const getUserCollections = async (username: string) => {
  const response = await api.get<UserCollectionsResponse>(`/api/users/${username}/collections`);
  return response.data;
};

const useUserCollections = (username: string) => {
  return useQuery({
    queryKey: queryKeys.userCollections(username),
    queryFn: () => getUserCollections(username),
    enabled: !!username,
  });
};

export default useUserCollections;
