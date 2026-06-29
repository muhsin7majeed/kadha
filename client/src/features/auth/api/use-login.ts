import { useMutation } from '@tanstack/react-query';

import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { LoginInputs, LoginResponse } from '../auth.types';

const login = async (data: LoginInputs) => {
  const response = await api.post<LoginResponse>('/api/auth/login', data);
  return response.data;
};

const useLogin = () => {
  return useMutation<LoginResponse, unknown, LoginInputs>({
    mutationFn: (data: LoginInputs) => login(data),
    onError: useErrorHandler,
  });
};

export default useLogin;
