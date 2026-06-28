import { QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';

const friendshipMutationQueryKeys = [
  queryKeys.friendships,
  queryKeys.searchUsers,
  queryKeys.notifications,
  ['user-profile'],
  ['user-watched'],
  ['user-liked'],
  ['user-watch-list'],
  ['user-collections'],
];

const invalidateFriendshipQueries = (queryClient: QueryClient) => {
  friendshipMutationQueryKeys.forEach((queryKey) => {
    queryClient.invalidateQueries({ queryKey });
  });
};

export default invalidateFriendshipQueries;
