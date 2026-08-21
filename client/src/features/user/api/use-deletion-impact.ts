import { useQuery } from '@tanstack/react-query';

import { DeletionImpact } from '@/features/user/account-deletion.types';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';

const getDeletionImpact = async () => {
  const response = await api.get<BaseResponse<DeletionImpact>>('/api/user/deletion-impact');
  return response.data.data;
};

const useDeletionImpact = () =>
  useQuery({
    queryKey: queryKeys.deletionImpact,
    queryFn: getDeletionImpact,
  });

export default useDeletionImpact;
