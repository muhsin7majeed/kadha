import { Box, HStack, Separator, SimpleGrid, Stack, Text } from '@chakra-ui/react';

import EmptyState from '@/components/info-states/empty-state';
import MediaCard from '@/components/media-card';
import CollectionMembersDialog from '@/features/collections/components/collection-members-dialog';
import CollectionSharingMeta from '@/features/collections/components/collection-sharing-meta';
import { CollectionDetails } from '@/features/collections/collections.types';
import { collectionMediaToMediaCardModel } from '@/features/collections/utils/collection-media';

interface CollectionDetailsContentProps {
  collection: CollectionDetails;
}

const CollectionDetailsContent = ({ collection }: CollectionDetailsContentProps) => (
  <Box>
    <Stack gap="2" mb="4">
      {collection.description && (
        <Text color="fg.muted" textStyle="supporting">
          {collection.description}
        </Text>
      )}

      <HStack gap="2" flexWrap="wrap">
        <CollectionSharingMeta collection={collection} />
      </HStack>

      <CollectionMembersDialog collection={collection} />
    </Stack>

    <HStack my="4">
      <Separator flex="1" />
      <Text flexShrink="0" color="fg.muted" textStyle="supporting">
        In this collection
      </Text>
      <Separator flex="1" />
    </HStack>

    {collection.media.length > 0 ? (
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6}>
        {collection.media.map((media) => (
          <MediaCard key={`${media.media_type}-${media.media_id}`} media={collectionMediaToMediaCardModel(media)} />
        ))}
      </SimpleGrid>
    ) : (
      <EmptyState title="No media" description="Woah, such wasted potential!" />
    )}
  </Box>
);

export default CollectionDetailsContent;
