import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { useQuery } from '@tanstack/react-query';
import { CollectionInviteUserSearchResult } from '../collections.types';

const searchCollectionInviteUsers = async (collectionId: string, query: string) => {
  const response = await api.get<BaseResponse<CollectionInviteUserSearchResult[]>>(
    `/api/collection/${collectionId}/share/users/search`,
    {
      params: { q: query },
    },
  );

  return response.data.data;
};

const useSearchCollectionInviteUsers = (collectionId: string, query: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.collectionInviteUserSearch(collectionId, query),
    queryFn: () => searchCollectionInviteUsers(collectionId, query),
    enabled: enabled && query.trim().length > 0,
  });
};

export default useSearchCollectionInviteUsers;
