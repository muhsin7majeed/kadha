import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { NavigationPreferences } from '@/features/navigation/navigation.types';

const fetchNavigationPreferences = async () => {
  const response = await api.get<{ data: NavigationPreferences }>('/api/navigation-preferences');
  return response.data.data;
};

const useNavigationPreferences = () =>
  useQuery({
    queryKey: queryKeys.navigationPreferences,
    queryFn: fetchNavigationPreferences,
    staleTime: 1000 * 60 * 5,
  });

export default useNavigationPreferences;
