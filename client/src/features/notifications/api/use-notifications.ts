import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse, Notification } from '@/types/common';
import { useQuery } from '@tanstack/react-query';

const getNotifications = async () => {
  const response = await api.get<BaseResponse<Notification[]>>('/api/user/notifications');
  return response.data?.data;
};

const useNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: getNotifications,
  });
};

export default useNotifications;
