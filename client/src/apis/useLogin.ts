import { useErrorHandler } from '@/hooks/useErrorHandler';
import { LoginInputs } from '@/pages/auth/AuthForm';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const login = async (data: LoginInputs) => {
  const response = await axios.post('/api/auth/login', data);
  return response.data;
};

const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginInputs) => login(data),
    onError: useErrorHandler,
  });
};

export default useLogin;
