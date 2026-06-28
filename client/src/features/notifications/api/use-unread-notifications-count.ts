import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { useQuery } from '@tanstack/react-query';
import { UnreadNotificationsCount } from '../notifications.types';

const getUnreadNotificationsCount = async () => {
  const response = await api.get<BaseResponse<UnreadNotificationsCount>>('/api/notifications/unread-count');

  return response.data.data;
};

const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: queryKeys.unreadNotificationsCount,
    queryFn: getUnreadNotificationsCount,
  });
};

export default useUnreadNotificationsCount;
