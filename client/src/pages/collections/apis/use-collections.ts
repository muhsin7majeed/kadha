import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios-instance';
import { Collection } from '@/types/collections';
import { BaseResponse } from '@/types/common';

const getCollections = async () => {
  const response = await api.get<BaseResponse<Collection[]>>('/api/collection');
  return response.data.data;
};

const useCollections = () => {
  return useQuery({
    queryKey: ['collections'],
    queryFn: () => getCollections(),
  });
};

export default useCollections;
