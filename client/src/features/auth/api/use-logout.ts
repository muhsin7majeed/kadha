import { useMutation } from '@tanstack/react-query';

import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';

const logout = async () => {
  const response = await api.post('/api/auth/logout');
  return response.data;
};

const useLogout = () => {
  return useMutation<void, Error>({
    mutationFn: () => logout(),
    onError: useErrorHandler,
  });
};

export default useLogout;
