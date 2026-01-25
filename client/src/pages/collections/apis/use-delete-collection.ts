import { useErrorHandler } from '@/hooks/use-error-handler';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios-instance';

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
