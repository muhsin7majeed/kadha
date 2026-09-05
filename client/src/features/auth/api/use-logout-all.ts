import { useMutation } from '@tanstack/react-query';

import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';

const logoutAll = async () => {
  const response = await api.post('/api/auth/logout-all', {});
  return response.data;
};

const useLogoutAll = () => {
  return useMutation<void, unknown>({
    mutationFn: () => logoutAll(),
    onError: useErrorHandler,
  });
};

export default useLogoutAll;
