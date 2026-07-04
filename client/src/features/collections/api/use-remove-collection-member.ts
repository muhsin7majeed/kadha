import { useErrorHandler } from '@/hooks/use-error-handler';
import { invalidateCollection, invalidateCollections } from '@/features/collections/api/invalidate-collection-queries';
import api from '@/lib/axios-instance';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RemoveCollectionMemberPayload {
  collectionId: string;
  memberId: string;
}

const removeCollectionMember = async ({ collectionId, memberId }: RemoveCollectionMemberPayload) => {
  return api.delete(`/api/collection/${collectionId}/members/${memberId}`);
};

const useRemoveCollectionMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCollectionMember,
    onError: useErrorHandler,
    onSuccess: (_data, variables) => {
      invalidateCollection(queryClient, variables.collectionId);
      invalidateCollections(queryClient);
    },
  });
};

export default useRemoveCollectionMember;
