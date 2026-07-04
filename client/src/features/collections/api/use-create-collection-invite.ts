import { useErrorHandler } from '@/hooks/use-error-handler';
import { invalidateCollectionInviteQueries } from '@/features/collections/api/invalidate-collection-queries';
import api from '@/lib/axios-instance';
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

  return useMutation<unknown, unknown, CreateCollectionInvitePayload>({
    mutationFn: createCollectionInvite,
    onError: useErrorHandler,
    onSuccess: (_data, variables) => {
      invalidateCollectionInviteQueries(queryClient, variables.collectionId);
    },
  });
};

export default useCreateCollectionInvite;
