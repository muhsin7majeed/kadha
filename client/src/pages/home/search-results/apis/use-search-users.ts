import api from '@/lib/axios-instance';
import { useQuery } from '@tanstack/react-query';
import { UserSearchResult } from '@/types/user';
import { BaseResponse } from '@/types/common';

const fetchSearchUsers = async (query: string) => {
  const params = new URLSearchParams();
  params.set('query', query);

  const response = await api.get<BaseResponse<UserSearchResult[]>>(`/api/user/search/`, { params });
  return response.data?.data;
};

const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: ['search-users', query],
    queryFn: () => fetchSearchUsers(query),
    enabled: !!query,
  });
};

export default useSearchUsers;
