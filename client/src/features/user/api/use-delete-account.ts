import { useMutation } from '@tanstack/react-query';

import { DeleteAccountPayload } from '@/features/user/account-deletion.types';
import { DeleteAccountResponse } from '@/features/user/user.types';
import api from '@/lib/axios-instance';

const deleteAccount = async (data: DeleteAccountPayload) => {
  const response = await api.delete<DeleteAccountResponse>('/api/user/me', {
    data,
  });

  return response.data;
};

const useDeleteAccount = () =>
  useMutation<DeleteAccountResponse, unknown, DeleteAccountPayload>({
    mutationFn: deleteAccount,
  });

export default useDeleteAccount;
