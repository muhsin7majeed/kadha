import { useMutation } from '@tanstack/react-query';

import { ChangePasswordInputs, ChangePasswordResponse } from '@/features/auth/auth.types';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';

type ChangePasswordRequest = Omit<ChangePasswordInputs, 'confirmNewPassword'>;

const changePassword = async (data: ChangePasswordInputs) => {
  const payload: ChangePasswordRequest = {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
  };
  const response = await api.post<ChangePasswordResponse>('/api/auth/password', payload);

  return response.data;
};

const useChangePassword = () =>
  useMutation<ChangePasswordResponse, unknown, ChangePasswordInputs>({
    mutationFn: changePassword,
    onError: useErrorHandler,
  });

export default useChangePassword;
