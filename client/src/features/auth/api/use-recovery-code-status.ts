import { useQuery } from '@tanstack/react-query';

import { RecoveryCodeStatusResponse } from '@/features/auth/auth.types';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';

const getRecoveryCodeStatus = async () => {
  const response = await api.get<RecoveryCodeStatusResponse>('/api/auth/recovery-code/status');
  return response.data;
};

const useRecoveryCodeStatus = () => {
  return useQuery({
    queryKey: queryKeys.recoveryCodeStatus,
    queryFn: getRecoveryCodeStatus,
    staleTime: Infinity,
  });
};

export default useRecoveryCodeStatus;
