import { useMutation } from '@tanstack/react-query';

import { RecoverAccountInputs, RecoverAccountResponse } from '@/features/auth/auth.types';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';

type RecoverAccountRequest = Omit<RecoverAccountInputs, 'confirmNewPassword'>;

const recoverAccount = async (data: RecoverAccountInputs) => {
  const payload: RecoverAccountRequest = {
    username: data.username,
    recoveryCode: data.recoveryCode,
    newPassword: data.newPassword,
  };
  const response = await api.post<RecoverAccountResponse>('/api/auth/recover', payload);

  return response.data;
};

const useRecoverAccount = () => {
  return useMutation<RecoverAccountResponse, unknown, RecoverAccountInputs>({
    mutationFn: recoverAccount,
    onError: useErrorHandler,
  });
};

export default useRecoverAccount;
