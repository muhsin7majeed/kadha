import { QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';

const friendshipMutationQueryKeys = [
  queryKeys.friendships,
  queryKeys.searchUsers,
  queryKeys.notifications,
  queryKeys.userProfiles,
  queryKeys.userWatchedRoot,
  queryKeys.userLikedRoot,
  queryKeys.userWatchListRoot,
  queryKeys.userCollectionsRoot,
];

const invalidateFriendshipQueries = (queryClient: QueryClient) => {
  friendshipMutationQueryKeys.forEach((queryKey) => {
    queryClient.invalidateQueries({ queryKey });
  });
};

export default invalidateFriendshipQueries;
