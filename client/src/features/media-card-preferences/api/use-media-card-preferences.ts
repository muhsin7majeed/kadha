import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/use-auth';
import type { MediaCardPreferences } from '@/features/media-card-preferences/media-card-preferences.types';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';

const fetchMediaCardPreferences = async () => {
  const response = await api.get<{ data: MediaCardPreferences }>('/api/media-card-preferences');
  return response.data.data;
};

const useMediaCardPreferences = () => {
  const { status } = useAuth();
  return useQuery({
    queryKey: queryKeys.mediaCardPreferences,
    queryFn: fetchMediaCardPreferences,
    enabled: status === 'authenticated',
    staleTime: 1000 * 60 * 5,
  });
};

export default useMediaCardPreferences;
