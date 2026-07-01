import { Badge, HStack, Text } from '@chakra-ui/react';
import { LuUsers } from 'react-icons/lu';

import { Collection } from '../collections.types';
import { getCollectionAccessLabel, getCollectionSharingLabel, isCollectionShared } from '../utils/collection-sharing';

interface CollectionSharedIconProps {
  collection: Collection;
}

interface CollectionSharingMetaProps {
  collection: Collection;
  showAccess?: boolean;
}

const CollectionSharedIcon: React.FC<CollectionSharedIconProps> = ({ collection }) => {
  if (!isCollectionShared(collection)) return null;

  return <LuUsers aria-label="Shared collection" />;
};

const CollectionSharingMeta: React.FC<CollectionSharingMetaProps> = ({ collection, showAccess = true }) => {
  const sharingLabel = getCollectionSharingLabel(collection);
  const accessLabel = showAccess ? getCollectionAccessLabel(collection) : null;

  if (!sharingLabel && !accessLabel) return null;

  return (
    <HStack gap="2" color="fg.muted" fontSize="sm" flexWrap="wrap">
      {sharingLabel && (
        <HStack as="span" gap="1">
          <CollectionSharedIcon collection={collection} />
          <Text as="span">{sharingLabel}</Text>
        </HStack>
      )}

      {accessLabel && (
        <Badge size="sm" variant="surface">
          {accessLabel}
        </Badge>
      )}
    </HStack>
  );
};

export default CollectionSharingMeta;
export { CollectionSharedIcon };
