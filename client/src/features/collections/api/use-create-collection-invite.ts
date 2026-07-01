import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CollectionMemberRole } from '../collections.types';

interface CreateCollectionInvitePayload {
  collectionId: string;
  inviteeId: string;
  role: CollectionMemberRole;
}

const createCollectionInvite = async ({ collectionId, inviteeId, role }: CreateCollectionInvitePayload) => {
  return api.post(`/api/collection/${collectionId}/invites`, { inviteeId, role });
};

const useCreateCollectionInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCollectionInvite,
    onError: useErrorHandler,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collectionInvites(variables.collectionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.collectionInviteUsers(variables.collectionId) });
    },
  });
};

export default useCreateCollectionInvite;
