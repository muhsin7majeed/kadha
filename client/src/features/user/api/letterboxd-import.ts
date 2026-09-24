import api from '@/lib/axios-instance';
import type { LetterboxdFilm } from '@/features/user/letterboxd/parse-letterboxd-export';

export interface LetterboxdCandidate {
  id: number;
  title: string;
  year: number | null;
  posterPath: string | null;
  existing: boolean;
  ratingKept: boolean;
}

export interface LetterboxdMatch {
  uri: string;
  candidates: LetterboxdCandidate[];
  suggestedId: number | null;
  mappedId: number | null;
  mappingConflict: boolean;
  importedWatches: number;
  error: boolean;
}

export const previewLetterboxdFilms = async (films: LetterboxdFilm[]) => {
  const response = await api.post<{ data: LetterboxdMatch[] }>('/api/user/letterboxd/preview', { films });
  return response.data.data;
};

export const importLetterboxdFilms = async (films: (LetterboxdFilm & { tmdbId: number })[]) => {
  const response = await api.post('/api/user/letterboxd/import', { films });
  return response.data.data;
};
