import { useAtom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { MediaTypeFilter } from '@/types/common';

export const mediaTypeAtom = atomWithStorage<MediaTypeFilter>('mediaType', 'All', undefined, {
  getOnInit: true,
});

export const useMediaType = () => {
  return useAtom(mediaTypeAtom);
};

export const useMediaTypeValue = (): MediaTypeFilter => {
  return useAtomValue(mediaTypeAtom);
};
