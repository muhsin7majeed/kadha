import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import type { DiaryQuery, DiaryResponse } from '@/features/user-media/user-media.types';

const fetchDiary = async (query: DiaryQuery) => {
  const response = await api.get<DiaryResponse>('/api/user-media/diary', { params: query });
  return response.data;
};

const useDiary = (query: DiaryQuery, enabled = true) =>
  useQuery({
    queryKey: queryKeys.diary(query),
    queryFn: () => fetchDiary(query),
    enabled,
  });

export default useDiary;
