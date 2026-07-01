import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { useQuery } from '@tanstack/react-query';
import { CollectionInvite } from '../collections.types';

const getCollectionInvites = async (collectionId: string) => {
  const response = await api.get<BaseResponse<CollectionInvite[]>>(`/api/collection/${collectionId}/invites`);
  return response.data.data;
};

const useCollectionInvites = (collectionId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.collectionInvites(collectionId),
    queryFn: () => getCollectionInvites(collectionId),
    enabled,
  });
};

export default useCollectionInvites;
