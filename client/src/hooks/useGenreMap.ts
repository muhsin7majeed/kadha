import { useSetAtom } from 'jotai';
import { useQuery } from '@tanstack/react-query';

import { genreMapAtom } from '@/atoms/genreAtom';
import api from '@/lib/axiosInstance';

const fetchGenres = async () => {
  const response = await api.get<{ genres: Record<number, string> }>('/api/media/genres');
  return response.data.genres;
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
