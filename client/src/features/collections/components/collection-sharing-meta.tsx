import { Badge, HStack, Text } from '@chakra-ui/react';
import { LuUsers } from 'react-icons/lu';

import NavLink from '@/components/nav-link';
import { Collection } from '../collections.types';
import { getCollectionAccessLabel, getSharedMemberCount, isCollectionShared } from '../utils/collection-sharing';

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
  const sharedMemberCount = getSharedMemberCount(collection);
  const isSharedWithCurrentUser = collection.access?.relationship === 'member';
  const accessLabel = showAccess ? getCollectionAccessLabel(collection) : null;

  if (!isSharedWithCurrentUser && sharedMemberCount === 0 && !accessLabel) return null;

  return (
    <HStack gap="2" color="fg.muted" fontSize="sm" flexWrap="wrap">
      {isSharedWithCurrentUser && collection.owner?.username && (
        <HStack as="span" gap="1">
          <CollectionSharedIcon collection={collection} />
          <Text as="span">Created by</Text>
          <NavLink to={`/app/profile/${collection.owner.username}`}>{collection.owner.username}</NavLink>
        </HStack>
      )}

      {isSharedWithCurrentUser && !collection.owner?.username && (
        <HStack as="span" gap="1">
          <CollectionSharedIcon collection={collection} />
          <Text as="span">Shared with you</Text>
        </HStack>
      )}

      {!isSharedWithCurrentUser && sharedMemberCount > 0 && (
        <HStack as="span" gap="1">
          <CollectionSharedIcon collection={collection} />
          <Text as="span">
            Shared with {sharedMemberCount} {sharedMemberCount === 1 ? 'person' : 'people'}
          </Text>
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
