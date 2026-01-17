import { useMutation } from '@tanstack/react-query';

import { useErrorHandler } from '@/hooks/use-error-handler';
import { LoginInputs } from '@/pages/auth/auth-form';
import api from '@/lib/axios-instance';

interface LoginResponse {
  message: string;
  token: string;
  userId: string;
}

const login = async (data: LoginInputs) => {
  const response = await api.post<LoginResponse>('/api/auth/login', data);
  return response.data;
};

const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginInputs>({
    mutationFn: (data: LoginInputs) => login(data),
    onError: useErrorHandler,
  });
};

export default useLogin;
