import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { AddToCollectionPayload } from '@/features/collections/collections.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const addToCollection = async (payload: AddToCollectionPayload) => {
  return await api.post(`/api/collection/${payload.collectionId}/items`, payload);
};

const useAddToCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToCollection,
    onError: useErrorHandler,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections });
    },
  });
};

export default useAddToCollection;
