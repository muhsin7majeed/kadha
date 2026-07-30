import { useMutation } from '@tanstack/react-query';

import {
  ManageRecoveryCodeInputs,
  ManageRecoveryCodeResponse,
  RecoveryCodeStatusResponse,
} from '@/features/auth/auth.types';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';

const manageRecoveryCode = async (data: ManageRecoveryCodeInputs) => {
  const response = await api.post<ManageRecoveryCodeResponse>('/api/auth/recovery-code', data);
  return response.data;
};

const useManageRecoveryCode = () => {
  return useMutation<ManageRecoveryCodeResponse, unknown, ManageRecoveryCodeInputs>({
    mutationFn: manageRecoveryCode,
    onError: useErrorHandler,
    onSuccess: (data) => {
      queryClient.setQueryData<RecoveryCodeStatusResponse>(queryKeys.recoveryCodeStatus, {
        configured: true,
        createdAt: data.createdAt,
      });
    },
  });
};

export default useManageRecoveryCode;
