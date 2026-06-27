import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { useQuery } from '@tanstack/react-query';
import { Friend, FriendshipType } from '../friendship.types';

const getFriendships = async (type: FriendshipType) => {
  const response = await api.get<BaseResponse<Friend[]>>(`/api/friendship/friendships?type=${type}`);
  return response.data.data;
};

const useFriendships = (type: FriendshipType) => {
  return useQuery({
    queryKey: queryKeys.friendshipsByType(type),
    queryFn: () => getFriendships(type),
  });
};

export default useFriendships;
