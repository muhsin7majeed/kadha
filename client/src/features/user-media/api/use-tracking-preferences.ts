import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { BaseResponse } from '@/types/common';
import type { TrackingPreferences } from '../user-media.types';

const fetchTrackingPreferences = async () => {
  const response = await api.get<BaseResponse<TrackingPreferences>>('/api/user-media/tracking-preferences');
  return response.data.data;
};

const useTrackingPreferences = () =>
  useQuery({
    queryKey: queryKeys.trackingPreferences,
    queryFn: fetchTrackingPreferences,
    staleTime: 1000 * 60 * 5,
  });

export default useTrackingPreferences;
