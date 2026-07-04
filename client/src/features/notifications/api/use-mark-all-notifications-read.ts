import api from '@/lib/axios-instance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidateNotificationQueries } from './invalidate-notification-queries';

const markAllNotificationsRead = async () => {
  await api.patch('/api/notifications/read-all');
};

const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, void>({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
  });
};

export default useMarkAllNotificationsRead;
