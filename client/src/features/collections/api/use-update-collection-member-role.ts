import { useErrorHandler } from '@/hooks/use-error-handler';
import { invalidateCollection, invalidateCollections } from '@/features/collections/api/invalidate-collection-queries';
import api from '@/lib/axios-instance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CollectionMemberRole } from '../collections.types';

interface UpdateCollectionMemberRolePayload {
  collectionId: string;
  memberId: string;
  role: CollectionMemberRole;
}

const updateCollectionMemberRole = async ({ collectionId, memberId, role }: UpdateCollectionMemberRolePayload) => {
  return api.patch(`/api/collection/${collectionId}/members/${memberId}`, { role });
};

const useUpdateCollectionMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, UpdateCollectionMemberRolePayload>({
    mutationFn: updateCollectionMemberRole,
    onError: useErrorHandler,
    onSuccess: (_data, variables) => {
      invalidateCollection(queryClient, variables.collectionId);
      invalidateCollections(queryClient);
    },
  });
};

export default useUpdateCollectionMemberRole;
