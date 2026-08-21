import { QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';

export const invalidateCollections = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.collections }),
    queryClient.invalidateQueries({ queryKey: queryKeys.userCollectionsRoot }),
  ]);

export const invalidateCollection = (queryClient: QueryClient, collectionId?: string) =>
  queryClient.invalidateQueries({ queryKey: queryKeys.collectionById(collectionId) });

export const invalidateCollectionInviteQueries = (queryClient: QueryClient, collectionId: string) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.collectionInvites(collectionId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.collectionInviteUsers(collectionId) }),
  ]);
