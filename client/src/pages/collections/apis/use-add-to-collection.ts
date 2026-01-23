import { useErrorHandler } from '@/hooks/use-error-handler';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios-instance';
import { AddToCollectionPayload } from '@/types/collections';

const addToCollection = async (payload: AddToCollectionPayload) => {
  return await api.post(`/api/collection/${payload.collectionId}/items`, payload);
};

const useAddToCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToCollection,
    onError: useErrorHandler,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export default useAddToCollection;
