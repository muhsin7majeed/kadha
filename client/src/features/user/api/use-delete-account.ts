import { useMutation } from '@tanstack/react-query';

import { DeleteAccountInputs, DeleteAccountResponse } from '@/features/user/user.types';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';

const deleteAccount = async (data: DeleteAccountInputs) => {
  const response = await api.delete<DeleteAccountResponse>('/api/user/me', {
    data,
  });

  return response.data;
};

const useDeleteAccount = () =>
  useMutation<DeleteAccountResponse, unknown, DeleteAccountInputs>({
    mutationFn: deleteAccount,
    onError: useErrorHandler,
  });

export default useDeleteAccount;
