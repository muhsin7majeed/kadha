import { queryKeys } from '@/lib/query-keys';
import { queryClient } from '@/lib/query-client';
import { removeAccessToken } from '@/lib/token-manager';

export const clearSession = () => {
  removeAccessToken();
  queryClient.clear();
  queryClient.setQueryData(queryKeys.me, null);
};
