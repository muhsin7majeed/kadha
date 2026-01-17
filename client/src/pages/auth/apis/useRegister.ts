import { useMutation } from '@tanstack/react-query';

import { useErrorHandler } from '@/hooks/useErrorHandler';
import { RegisterInputs } from '@/pages/auth/auth-form';
import api from '@/lib/axiosInstance';

interface RegisterResponse {
  message: string;
  token: string;
  userId: string;
}

const register = async (data: RegisterInputs) => {
  const response = await api.post<RegisterResponse>('/api/auth/register', data);
  return response.data;
};

const useRegister = () => {
  return useMutation<RegisterResponse, Error, RegisterInputs>({
    mutationFn: (data: RegisterInputs) => register(data),
    onError: useErrorHandler,
  });
};

export default useRegister;
