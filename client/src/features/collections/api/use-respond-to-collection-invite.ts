import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
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
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections });
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotificationsCount });
    },
  });
};

export default useRespondToCollectionInvite;
