import { useQuery } from '@tanstack/react-query';

import type { HomePreferences } from '@/features/home/home.types';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';

const fetchHomePreferences = async () => {
  const response = await api.get<{ data: HomePreferences }>('/api/home-preferences');
  return response.data.data;
};

const useHomePreferences = () =>
  useQuery({
    queryKey: queryKeys.homePreferences,
    queryFn: fetchHomePreferences,
    staleTime: 1000 * 60 * 5,
  });

export default useHomePreferences;
