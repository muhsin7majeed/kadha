import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { PaginatedResponse } from '@/types/common';
import { useQuery } from '@tanstack/react-query';
import { Notification } from '../notifications.types';

const getNotifications = async (page: number) => {
  const response = await api.get<PaginatedResponse<Notification[]>>('/api/notifications', {
    params: { page },
  });

  return response.data;
};

const useNotifications = (page = 1) => {
  return useQuery({
    queryKey: queryKeys.notificationsPage(page),
    queryFn: () => getNotifications(page),
  });
};

export default useNotifications;
