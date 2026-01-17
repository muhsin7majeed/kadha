import { useSetAtom } from 'jotai';
import { useQuery } from '@tanstack/react-query';

import { genreMapAtom } from '@/atoms/genre-atom';
import api from '@/lib/axios-instance';
import { BaseResponse } from '@/types/common';

const fetchGenres = async () => {
  const response = await api.get<BaseResponse<Record<number, string>>>('/api/media/genres');
  return response.data.data;
};

export const useGenreMap = () => {
  const setGenreMap = useSetAtom(genreMapAtom);

  return useQuery({
    queryKey: ['genreMap'],
    queryFn: fetchGenres,
    staleTime: Infinity,
    select: (data: Record<number, string>) => {
      setGenreMap(data);
      return data;
    },
  });
};
