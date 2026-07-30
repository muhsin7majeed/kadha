import CommonSpinner from '@/components/spinners/common-spinner';
import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import MediaCard from '@/components/media-card';
import useUserCollections from '@/features/collections/api/use-user-collections';
import { collectionMediaToMediaCardModel } from '@/features/collections/utils/collection-media';
import { Accordion, Box, HStack, Separator, SimpleGrid, Span, Text } from '@chakra-ui/react';
import { useParams } from 'react-router';

const OtherUserCollectionsTab = () => {
  const { username = '' } = useParams();
  const { data, isLoading, error, refetch } = useUserCollections(username);

  if (isLoading) {
    return <CommonSpinner />;
  }

  if (error) {
    return <ErrorState title="Error" description="Failed to fetch collections" onRetry={refetch} />;
  }

  if (!data?.data.length) {
    return <EmptyState title="No collections" description="No collections found" />;
  }

  return (
    <Accordion.Root spaceY="6" variant="plain" collapsible size="lg">
      {data.data.map((collection) => (
        <Accordion.Item
          key={collection.id}
          value={collection.id}
          p="4"
          border="1px solid"
          borderColor="border.muted"
          borderRadius="lg"
        >
          <Accordion.ItemTrigger>
            <Span flex="1">{collection.name}</Span>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>

          <Accordion.ItemContent>
            <Accordion.ItemBody>
              <Box>
                {collection.description && (
                  <Text color="fg.muted" textStyle="supporting" mb="4">
                    {collection.description}
                  </Text>
                )}

                <HStack my="4">
                  <Separator flex="1" />
                  <Text flexShrink="0" color="fg.muted" textStyle="supporting">
                    In this collection
                  </Text>
                  <Separator flex="1" />
                </HStack>

                {collection.media?.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6}>
                    {collection.media.map((media) => (
                      <MediaCard
                        key={`${media.media_type}-${media.media_id}`}
                        media={collectionMediaToMediaCardModel(media)}
                      />
                    ))}
                  </SimpleGrid>
                ) : (
                  <EmptyState title="No media" description="This collection is empty" />
                )}
              </Box>
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
};

export default OtherUserCollectionsTab;
