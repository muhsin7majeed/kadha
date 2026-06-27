import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { useQuery } from '@tanstack/react-query';
import { Notification } from '../notifications.types';

const getNotifications = async () => {
  const response = await api.get<BaseResponse<Notification[]>>('/api/notifications');
  return response.data?.data;
};

const useNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: getNotifications,
  });
};

export default useNotifications;
