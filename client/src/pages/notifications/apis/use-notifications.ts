import api from '@/lib/axios-instance';
import { BaseResponse } from '@/types/common';
import { Notification } from '@/types/common';
import { useQuery } from '@tanstack/react-query';

const getNotifications = async () => {
  const response = await api.get<BaseResponse<Notification[]>>('/api/user/notifications');
  return response.data?.data;
};

const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });
};

export default useNotifications;
