import { useErrorHandler } from '@/hooks/use-error-handler';
import { invalidateCollections } from '@/features/collections/api/invalidate-collection-queries';
import { invalidateNotificationQueries } from '@/features/notifications/api/invalidate-notification-queries';
import api from '@/lib/axios-instance';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RespondToCollectionInvitePayload {
  inviteId: string;
  action: 'accept' | 'reject';
}

const respondToCollectionInvite = async ({ inviteId, action }: RespondToCollectionInvitePayload) => {
  return api.post(`/api/collection/invites/${inviteId}/respond`, { action });
};

const useRespondToCollectionInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: respondToCollectionInvite,
    onError: useErrorHandler,
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
      invalidateCollections(queryClient);
    },
  });
};

export default useRespondToCollectionInvite;
