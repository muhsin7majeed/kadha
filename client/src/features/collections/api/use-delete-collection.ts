import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidateCollections } from './invalidate-collection-queries';

const deleteCollection = async (collectionId: string) => {
  return await api.delete(`/api/collection/${collectionId}`);
};

const useDeleteCollection = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, string>({
    mutationFn: deleteCollection,
    onError: useErrorHandler,
    onSuccess: () => {
      invalidateCollections(queryClient);
    },
  });
};

export default useDeleteCollection;
