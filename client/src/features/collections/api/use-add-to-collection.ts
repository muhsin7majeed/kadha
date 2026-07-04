import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { AddToCollectionPayload } from '@/features/collections/collections.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidateCollections } from './invalidate-collection-queries';

const addToCollection = async (payload: AddToCollectionPayload) => {
  return await api.post(`/api/collection/${payload.collectionId}/items`, payload);
};

const useAddToCollection = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, AddToCollectionPayload>({
    mutationFn: addToCollection,
    onError: useErrorHandler,
    onSuccess: () => {
      invalidateCollections(queryClient);
    },
  });
};

export default useAddToCollection;
