import api from '@/lib/axios-instance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidateNotificationQueries } from './invalidate-notification-queries';

const markNotificationRead = async (notificationId: string) => {
  await api.patch(`/api/notifications/${notificationId}/read`);
};

const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
  });
};

export default useMarkNotificationRead;
