import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { PaginatedResponse } from '@/types/common';
import { UserSearchResult } from '@/features/user/user.types';
import { useQuery } from '@tanstack/react-query';

const fetchSearchUsers = async (query: string, page: number) => {
  const params = new URLSearchParams();
  params.set('query', query);
  params.set('page', String(page));

  const response = await api.get<PaginatedResponse<UserSearchResult[]>>(`/api/user/search/`, { params });
  return response.data;
};

const useSearchUsers = (query: string, page = 1, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.searchUsersByQuery(query, page),
    queryFn: () => fetchSearchUsers(query, page),
    enabled: enabled && !!query,
  });
};

export default useSearchUsers;
