import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
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

  return useMutation({
    mutationFn: revokeCollectionInvite,
    onError: useErrorHandler,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collectionInvites(variables.collectionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.collectionInviteUsers(variables.collectionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotificationsCount });
    },
  });
};

export default useRevokeCollectionInvite;
