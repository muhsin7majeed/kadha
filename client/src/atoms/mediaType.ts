import { useAtom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { MediaType } from '@/types/media';

export const mediaTypeAtom = atomWithStorage<MediaType>('mediaType', 'All', undefined, { getOnInit: true });

export const useMediaType = () => {
  return useAtom(mediaTypeAtom);
};

export const useMediaTypeValue = () => {
  return useAtomValue(mediaTypeAtom);
};
