import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const deleteCollection = async (collectionId: string) => {
  return await api.delete(`/api/collection/${collectionId}`);
};

const useDeleteCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCollection,
    onError: useErrorHandler,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export default useDeleteCollection;
