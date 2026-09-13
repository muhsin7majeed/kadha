import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { DiaryInsightsResponse } from '@/features/user-media/user-media.types';
import type { DiaryMediaType } from '@/features/user-media/components/diary-filters';

const fetchDiaryInsights = async (year: number, mediaType: DiaryMediaType) => {
  const response = await api.get<DiaryInsightsResponse>('/api/user-media/diary/insights', {
    params: { year, mediaType },
  });
  return response.data;
};

const useDiaryInsights = (year: number, mediaType: DiaryMediaType, enabled = true) =>
  useQuery({
    queryKey: queryKeys.diaryInsights(year, mediaType),
    queryFn: () => fetchDiaryInsights(year, mediaType),
    enabled,
  });

export default useDiaryInsights;
