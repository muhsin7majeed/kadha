import api from '@/lib/axios-instance';
import { RefreshResponse } from '../auth.types';

const refresh = async (): Promise<RefreshResponse> => {
  const response = await api.post<RefreshResponse>('/api/auth/refresh');
  return response.data;
};

export default refresh;
