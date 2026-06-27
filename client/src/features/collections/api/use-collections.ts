import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse, MediaType } from '@/types/common';
import { Collection } from '@/features/collections/collections.types';
import { useQuery } from '@tanstack/react-query';

interface GetCollectionsParams {
  mediaId: number;
  mediaType: MediaType;
}

const getCollections = async (params?: GetCollectionsParams) => {
  const response = await api.get<BaseResponse<Collection[]>>('/api/collection', { params });
  return response.data.data;
};

const useCollections = (params?: GetCollectionsParams) => {
  return useQuery({
    queryKey: queryKeys.collectionsList(params),
    queryFn: () => getCollections(params),
  });
};

export default useCollections;
