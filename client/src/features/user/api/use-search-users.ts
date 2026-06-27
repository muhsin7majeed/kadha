import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { BaseResponse } from '@/types/common';
import { UserSearchResult } from '@/types/user';
import { useQuery } from '@tanstack/react-query';

const fetchSearchUsers = async (query: string) => {
  const params = new URLSearchParams();
  params.set('query', query);

  const response = await api.get<BaseResponse<UserSearchResult[]>>(`/api/user/search/`, { params });
  return response.data?.data;
};

const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: queryKeys.searchUsersByQuery(query),
    queryFn: () => fetchSearchUsers(query),
    enabled: !!query,
  });
};

export default useSearchUsers;
