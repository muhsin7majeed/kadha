import { QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';

const friendshipMutationQueryKeys = [queryKeys.friendships, queryKeys.searchUsers, queryKeys.notifications];

const invalidateFriendshipQueries = (queryClient: QueryClient) => {
  friendshipMutationQueryKeys.forEach((queryKey) => {
    queryClient.invalidateQueries({ queryKey });
  });
};

export default invalidateFriendshipQueries;
