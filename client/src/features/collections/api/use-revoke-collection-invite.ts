import { useErrorHandler } from '@/hooks/use-error-handler';
import { invalidateCollectionInviteQueries } from '@/features/collections/api/invalidate-collection-queries';
import { invalidateNotificationQueries } from '@/features/notifications/api/invalidate-notification-queries';
import api from '@/lib/axios-instance';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RevokeCollectionInvitePayload {
  collectionId: string;
  inviteId: string;
}

const revokeCollectionInvite = async ({ collectionId, inviteId }: RevokeCollectionInvitePayload) => {
  return api.post(`/api/collection/${collectionId}/invites/${inviteId}/revoke`);
};

const useRevokeCollectionInvite = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, RevokeCollectionInvitePayload>({
    mutationFn: revokeCollectionInvite,
    onError: useErrorHandler,
    onSuccess: (_data, variables) => {
      invalidateCollectionInviteQueries(queryClient, variables.collectionId);
      invalidateNotificationQueries(queryClient);
    },
  });
};

export default useRevokeCollectionInvite;
