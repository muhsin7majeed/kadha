import { QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';

export const invalidateNotificationQueries = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
    queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotificationsCount }),
  ]);
