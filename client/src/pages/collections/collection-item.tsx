import { Collection } from '@/types/collections';
import { AbsoluteCenter, Accordion, Box, HStack, Separator, SimpleGrid, Span, Text } from '@chakra-ui/react';
import useCollection from './apis/use-collection';
import CommonSpinner from '@/components/spinners/common-spinner';
import ErrorState from '@/components/info-states/error-state';
import EmptyState from '@/components/info-states/empty-state';
import SyncSpinner from '@/components/spinners/sync-spinner';
import MediaCard from '@/components/media-card';
import CollectionMenu from './collection-menu';

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
            <Span flex="1">{collection.name}</Span>

            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>

          <AbsoluteCenter axis="vertical" insetEnd="10">
            {isFetching && <SyncSpinner size="sm" me="2" />}
            <CollectionMenu collection={collection} />
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
                <Text color="fg.muted" fontSize="sm" mb="4">
                  {collectionData.description}
                </Text>

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
                          genre_ids: JSON.parse(media.genre_ids),
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
