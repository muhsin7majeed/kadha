import { queryKeys } from '@/lib/query-keys';
import { queryClient } from '@/lib/query-client';
import { removeAccessToken } from '@/lib/token-manager';

export const clearSession = async () => {
  removeAccessToken();
  await queryClient.cancelQueries();
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== queryKeys.me[0],
  });
  queryClient.setQueryData(queryKeys.me, null);
};
