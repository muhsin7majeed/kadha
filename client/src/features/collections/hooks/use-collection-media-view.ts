import useMediaView from '@/features/media/hooks/use-media-view';

export const collectionMediaViewStorageKey = 'kadha.collection-media-view';

const useCollectionMediaView = () => useMediaView(collectionMediaViewStorageKey);

export default useCollectionMediaView;
