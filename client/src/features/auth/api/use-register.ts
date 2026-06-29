import { useMutation } from '@tanstack/react-query';

import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { LoginResponse, RegisterInputs } from '../auth.types';

const register = async (data: RegisterInputs) => {
  const response = await api.post<LoginResponse>('/api/auth/register', data);
  return response.data;
};

const useRegister = () => {
  return useMutation<LoginResponse, unknown, RegisterInputs>({
    mutationFn: (data: RegisterInputs) => register(data),
    onError: useErrorHandler,
  });
};

export default useRegister;
