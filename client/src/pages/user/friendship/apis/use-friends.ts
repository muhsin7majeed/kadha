import api from '@/lib/axios-instance';
import { BaseResponse } from '@/types/common';
import { Friend } from '@/types/user';
import { useQuery } from '@tanstack/react-query';

export type FriendshipType = 'friends' | 'sent' | 'received' | 'blocked';

const getFriendships = async (type: FriendshipType) => {
  const response = await api.get<BaseResponse<Friend[]>>(`/api/friendship/friendships?type=${type}`);
  return response.data.data;
};

const useFriendships = (type: FriendshipType) => {
  return useQuery({
    queryKey: ['friendships', type],
    queryFn: () => getFriendships(type),
  });
};

export default useFriendships;
