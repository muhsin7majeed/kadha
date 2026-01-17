import api from '@/lib/axios-instance';

export interface RefreshResponse {
  accessToken: string;
}

const refresh = async (): Promise<RefreshResponse> => {
  const response = await api.post<RefreshResponse>('/api/auth/refresh');
  return response.data;
};

export default refresh;
