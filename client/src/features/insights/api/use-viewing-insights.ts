import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { InsightMediaType, ViewingInsights } from '../insights.types';

const getViewingInsights = async (mediaType: InsightMediaType) => {
  const response = await api.get<BaseResponse<ViewingInsights>>('/api/user/insights', {
    params: { mediaType },
  });

  return response.data.data;
};

const useViewingInsights = (mediaType: InsightMediaType, enabled = true) =>
  useQuery({
    queryKey: queryKeys.viewingInsights(mediaType),
    queryFn: () => getViewingInsights(mediaType),
    enabled,
  });

export default useViewingInsights;
