import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios-instance';
import { CollectionDetails } from '@/types/collections';
import { BaseResponse } from '@/types/common';

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
    queryKey: ['collection', params?.collectionId],
    queryFn: () => getCollection(params),
    enabled: params?.enabled,
  });
};

export default useCollection;
