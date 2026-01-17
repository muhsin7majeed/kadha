import { useMutation } from '@tanstack/react-query';

import { useErrorHandler } from '@/hooks/use-error-handler';
import { RegisterInputs } from '@/pages/auth/auth-form';
import api from '@/lib/axios-instance';
import { LoginResponse } from './use-login';

const register = async (data: RegisterInputs) => {
  const response = await api.post<LoginResponse>('/api/auth/register', data);
  return response.data;
};

const useRegister = () => {
  return useMutation<LoginResponse, Error, RegisterInputs>({
    mutationFn: (data: RegisterInputs) => register(data),
    onError: useErrorHandler,
  });
};

export default useRegister;
