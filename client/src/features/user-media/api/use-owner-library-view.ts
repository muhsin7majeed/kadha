import useMediaView from '@/features/media/hooks/use-media-view';
import type { OwnerMediaLibraryKey } from '@/features/user-media/user-media.types';

export const ownerLibraryViewStorageKey = (library: OwnerMediaLibraryKey) => `kadha.owner-library-view.${library}`;

const useOwnerLibraryView = (library: OwnerMediaLibraryKey) => useMediaView(ownerLibraryViewStorageKey(library));

export default useOwnerLibraryView;
