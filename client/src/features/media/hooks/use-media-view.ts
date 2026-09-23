import { useEffect, useState } from 'react';

import type { MediaView } from '@/features/media/media-view.types';

const DEFAULT_VIEW: MediaView = 'grid';
const VALID_VIEWS: MediaView[] = ['grid', 'list', 'table'];

const isMediaView = (value: string | null): value is MediaView =>
  value !== null && VALID_VIEWS.includes(value as MediaView);

const readStoredView = (storageKey: string): MediaView => {
  if (typeof window === 'undefined') return DEFAULT_VIEW;

  try {
    const storedView = window.localStorage.getItem(storageKey);
    return isMediaView(storedView) ? storedView : DEFAULT_VIEW;
  } catch {
    return DEFAULT_VIEW;
  }
};

const useMediaView = (storageKey: string) => {
  const [view, setView] = useState<MediaView>(() => readStoredView(storageKey));

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, view);
    } catch {
      // The selected view still works for this session when storage is unavailable.
    }
  }, [storageKey, view]);

  return { view, setView };
};

export default useMediaView;
