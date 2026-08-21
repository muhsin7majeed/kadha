import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { queryKeys } from '@/lib/query-keys';

export const isUnavailableCollectionError = (error: unknown) =>
  isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 404);

export const clearUnavailableCollection = async (queryClient: QueryClient, collectionId: string) => {
  queryClient.removeQueries({ queryKey: queryKeys.collectionById(collectionId), exact: true });
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.collections }),
    queryClient.invalidateQueries({ queryKey: queryKeys.userCollectionsRoot }),
  ]);
};
