import { Flex } from '@chakra-ui/react';

import MediaCardGrid from '@/components/media-card-grid';
import MediaListView from '@/components/media-list-view';
import MediaTableView from '@/components/media-table-view';
import MediaViewSwitcher from '@/components/media-view-switcher';
import type { CollectionMedia } from '@/features/collections/collections.types';
import useCollectionMediaView from '@/features/collections/hooks/use-collection-media-view';
import { collectionMediaToMediaCardModel } from '@/features/collections/utils/collection-media';

interface CollectionMediaViewsProps {
  media: CollectionMedia[];
  detailsPathPrefix?: string;
  showActions?: boolean;
}

const CollectionMediaViews = ({
  media,
  detailsPathPrefix = '/app/media',
  showActions = true,
}: CollectionMediaViewsProps) => {
  const { view, setView } = useCollectionMediaView();
  const items = media.map(collectionMediaToMediaCardModel);
  const viewItems = items.map((item) => ({ media: item }));

  return (
    <>
      <Flex justify="flex-end" mb="4">
        <MediaViewSwitcher value={view} onChange={setView} />
      </Flex>

      {view === 'list' ? (
        <MediaListView
          data={viewItems}
          detailsPathPrefix={detailsPathPrefix}
          showActions={showActions}
        />
      ) : view === 'table' ? (
        <MediaTableView
          ariaLabel="Collection media table"
          data={viewItems}
          detailsPathPrefix={detailsPathPrefix}
          showActions={showActions}
        />
      ) : (
        <MediaCardGrid
          detailsPathPrefix={detailsPathPrefix}
          media={items}
          showActions={showActions}
        />
      )}
    </>
  );
};

export default CollectionMediaViews;
