import { atom, useAtomValue } from 'jotai';

export const genreMapAtom = atom<Record<number, string>>({});

export const useGenreAtom = () => {
  const genreMap = useAtomValue(genreMapAtom);
  return genreMap;
};
