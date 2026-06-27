import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { CollectionDetails } from '@/features/collections/collections.types';
import { useQuery } from '@tanstack/react-query';

interface GetCollectionParams {
  collectionId: string;
}

const getCollection = async (params?: GetCollectionParams) => {
  const response = await api.get<BaseResponse<CollectionDetails>>(`/api/collection/${params?.collectionId}`);
  return response.data.data;
};

interface UseCollectionParams extends GetCollectionParams {
  enabled: boolean;
}

const useCollection = (params?: UseCollectionParams) => {
  return useQuery({
    queryKey: queryKeys.collectionById(params?.collectionId),
    queryFn: () => getCollection(params),
    enabled: params?.enabled,
  });
};

export default useCollection;
