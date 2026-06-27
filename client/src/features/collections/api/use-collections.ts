import api from '@/lib/axios-instance';
import { BaseResponse, MediaType } from '@/types/common';
import { Collection } from '@/types/collections';
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
    queryKey: ['collections'],
    queryFn: () => getCollections(params),
  });
};

export default useCollections;
