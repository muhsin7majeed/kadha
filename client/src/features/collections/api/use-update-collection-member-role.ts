import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
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

  return useMutation({
    mutationFn: updateCollectionMemberRole,
    onError: useErrorHandler,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collectionById(variables.collectionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections });
    },
  });
};

export default useUpdateCollectionMemberRole;
