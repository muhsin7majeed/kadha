import { useEffect, useState } from 'react';

import type { OwnerMediaLibraryKey, OwnerMediaView } from '@/features/user-media/user-media.types';

const DEFAULT_VIEW: OwnerMediaView = 'grid';
const VALID_VIEWS: OwnerMediaView[] = ['grid', 'list', 'table'];

export const ownerLibraryViewStorageKey = (library: OwnerMediaLibraryKey) => `kadha.owner-library-view.${library}`;

const isOwnerMediaView = (value: string | null): value is OwnerMediaView =>
  value !== null && VALID_VIEWS.includes(value as OwnerMediaView);

const readStoredView = (library: OwnerMediaLibraryKey): OwnerMediaView => {
  if (typeof window === 'undefined') return DEFAULT_VIEW;

  try {
    const storedView = window.localStorage.getItem(ownerLibraryViewStorageKey(library));
    return isOwnerMediaView(storedView) ? storedView : DEFAULT_VIEW;
  } catch {
    return DEFAULT_VIEW;
  }
};

const useOwnerLibraryView = (library: OwnerMediaLibraryKey) => {
  const [view, setView] = useState<OwnerMediaView>(() => readStoredView(library));

  useEffect(() => {
    try {
      window.localStorage.setItem(ownerLibraryViewStorageKey(library), view);
    } catch {
      // The selected view still works for this session when storage is unavailable.
    }
  }, [library, view]);

  return { view, setView };
};

export default useOwnerLibraryView;
