import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { PaginatedResponse } from '@/types/common';
import { useQuery } from '@tanstack/react-query';
import { Friend, FriendshipType } from '../friendship.types';

const getFriendships = async (type: FriendshipType, page: number) => {
  const response = await api.get<PaginatedResponse<Friend[]>>('/api/friendship/friendships', {
    params: { type, page },
  });
  return response.data;
};

const useFriendships = (type: FriendshipType, page = 1) => {
  return useQuery({
    queryKey: queryKeys.friendshipsByType(type, page),
    queryFn: () => getFriendships(type, page),
  });
};

export default useFriendships;
