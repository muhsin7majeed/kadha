import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios-instance';
import { Collection } from '@/types/collections';
import { BaseResponse, MediaType } from '@/types/common';

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
    queryKey: ['collections'],
    queryFn: () => getCollections(params),
  });
};

export default useCollections;
