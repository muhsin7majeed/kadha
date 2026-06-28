import { useQuery } from '@tanstack/react-query';

import { CollectionDetails } from '@/features/collections/collections.types';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { ResourceAccessResponse } from '@/types/common';

type UserCollectionsResponse = ResourceAccessResponse<CollectionDetails[]>;

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
