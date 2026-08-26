import { useQuery } from '@tanstack/react-query';

import { CollectionDetails } from '@/features/collections/collections.types';
import { getAccessResponseFromError } from '@/features/user-media/api/use-watched';
import api from '@/lib/axios-instance';
import { ResourceAccessResponse } from '@/types/common';

export type PublicCollectionResponse = ResourceAccessResponse<CollectionDetails | null>;

const getPublicCollection = async (collectionId: string) => {
  try {
    const response = await api.get<PublicCollectionResponse>(`/api/public/collections/${collectionId}`);
    return response.data;
  } catch (error) {
    return getAccessResponseFromError<PublicCollectionResponse>(error);
  }
};

const usePublicCollection = (collectionId: string) => {
  return useQuery({
    queryKey: ['public-collection', collectionId],
    queryFn: () => getPublicCollection(collectionId),
    enabled: !!collectionId,
    retry: false,
  });
};

export default usePublicCollection;
