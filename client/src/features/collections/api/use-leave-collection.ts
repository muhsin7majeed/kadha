import { useErrorHandler } from '@/hooks/use-error-handler';
import { invalidateCollections } from '@/features/collections/api/invalidate-collection-queries';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const leaveCollection = async (collectionId: string) => {
  return api.post(`/api/collection/${collectionId}/leave`);
};

const useLeaveCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveCollection,
    onError: useErrorHandler,
    onSuccess: (_data, collectionId) => {
      invalidateCollections(queryClient);
      queryClient.removeQueries({ queryKey: queryKeys.collectionById(collectionId) });
    },
  });
};

export default useLeaveCollection;
