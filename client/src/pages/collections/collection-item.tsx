import { Collection } from '@/features/collections/collections.types';
import { AbsoluteCenter, Accordion, Badge, Box, HStack, Separator, SimpleGrid, Span, Stack, Text } from '@chakra-ui/react';
import useCollection from '@/features/collections/api/use-collection';
import CommonSpinner from '@/components/spinners/common-spinner';
import ErrorState from '@/components/info-states/error-state';
import EmptyState from '@/components/info-states/empty-state';
import SyncSpinner from '@/components/spinners/sync-spinner';
import MediaCard from '@/components/media-card';
import CollectionMenu from '@/features/collections/components/collection-menu';

const parseGenreIds = (genreIds: number[] | string | null | undefined) => {
  if (Array.isArray(genreIds)) return genreIds;
  if (!genreIds) return [];

  try {
    return JSON.parse(genreIds);
  } catch {
    return [];
  }
};

const formatRole = (role?: string) => {
  if (!role) return null;

  return role.charAt(0).toUpperCase() + role.slice(1);
};

interface CollectionItemProps {
  collection: Collection;
  index: number;
  isOpened: boolean;
}

const CollectionItem: React.FC<CollectionItemProps> = ({ collection, index, isOpened }) => {
  const {
    data: collectionData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useCollection({ collectionId: collection.id, enabled: isOpened });

  return (
    <>
      <Accordion.Item
        key={index}
        value={collection.id}
        p="4"
        border="1px solid"
        borderColor="border.muted"
        borderRadius="lg"
      >
        <Box position="relative">
          <Accordion.ItemTrigger>
            <Span flex="1">
              <Stack gap="1">
                <HStack gap="2" flexWrap="wrap">
                  <Text as="span" fontWeight="medium">
                    {collection.name}
                  </Text>

                  {collection.access?.relationship === 'member' && (
                    <Badge size="sm" colorPalette={collection.access.role === 'editor' ? 'green' : 'gray'}>
                      {formatRole(collection.access.role)}
                    </Badge>
                  )}
                </HStack>

                <HStack gap="2" color="fg.muted" fontSize="sm" flexWrap="wrap">
                  {collection.access?.relationship === 'member' && collection.owner && (
                    <Text as="span">Owner: {collection.owner.username}</Text>
                  )}
                  {typeof collection.itemCount === 'number' && <Text as="span">{collection.itemCount} items</Text>}
                  {typeof collection.memberCount === 'number' && (
                    <Text as="span">{collection.memberCount} members</Text>
                  )}
                </HStack>
              </Stack>
            </Span>

            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>

          <AbsoluteCenter axis="vertical" insetEnd="10">
            {isFetching && <SyncSpinner size="sm" me="2" />}
            {collection.access?.canManageSharing !== false && <CollectionMenu collection={collection} />}
          </AbsoluteCenter>
        </Box>

        <Accordion.ItemContent>
          <Accordion.ItemBody>
            {isLoading ? (
              <CommonSpinner />
            ) : error ? (
              <ErrorState title="Error" description="Error fetching collection" onRetry={refetch} />
            ) : collectionData ? (
              <Box>
                <Stack gap="2" mb="4">
                  {collectionData.description && (
                    <Text color="fg.muted" fontSize="sm">
                      {collectionData.description}
                    </Text>
                  )}

                  <HStack gap="2" flexWrap="wrap">
                    {collectionData.owner && <Badge variant="surface">Owner: {collectionData.owner.username}</Badge>}
                    <Badge variant="surface">Role: {formatRole(collectionData.access.role)}</Badge>
                    {collectionData.members.slice(0, 4).map((member) => (
                      <Badge key={member.id} variant="outline">
                        {member.user.username}
                      </Badge>
                    ))}
                    {collectionData.members.length > 4 && (
                      <Badge variant="outline">+{collectionData.members.length - 4}</Badge>
                    )}
                  </HStack>
                </Stack>

                <HStack my="4">
                  <Separator flex="1" />
                  <Text flexShrink="0" color="fg.muted" fontSize="sm">
                    In this collection
                  </Text>
                  <Separator flex="1" />
                </HStack>

                {collectionData.media?.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6}>
                    {collectionData.media?.map((media) => (
                      <MediaCard
                        key={media.media_id}
                        media={{
                          id: media.media_id,
                          media_type: media.media_type,
                          title: media.title,
                          poster_path: media.poster_path,
                          vote_average: media.vote_average,
                          vote_count: media.vote_count,
                          adult: media.adult,
                          genre_ids: parseGenreIds(media.genre_ids),
                          release_date: media.release_date,
                          media_id: media.media_id,
                        }}
                      />
                    ))}
                  </SimpleGrid>
                ) : (
                  <EmptyState title="No media" description="Woah, such wasted potential!" />
                )}
              </Box>
            ) : (
              <EmptyState title="No collection" description="No collection found" />
            )}
          </Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
    </>
  );
};

export default CollectionItem;
