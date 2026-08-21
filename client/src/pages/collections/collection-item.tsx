import { Collection } from '@/features/collections/collections.types';
import { AbsoluteCenter, Accordion, Box, HStack, Span, Stack, Text } from '@chakra-ui/react';
import useCollection from '@/features/collections/api/use-collection';
import CommonSpinner from '@/components/spinners/common-spinner';
import ErrorState from '@/components/info-states/error-state';
import SyncSpinner from '@/components/spinners/sync-spinner';
import CollectionMenu from '@/features/collections/components/collection-menu';
import CollectionSharingMeta, { CollectionSharedIcon } from '@/features/collections/components/collection-sharing-meta';
import CollectionDetailsContent from '@/features/collections/components/collection-details-content';
import {
  clearUnavailableCollection,
  isUnavailableCollectionError,
} from '@/features/collections/utils/collection-query-errors';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

interface CollectionItemProps {
  collection: Collection;
  index: number;
  isOpened: boolean;
}

const CollectionItem: React.FC<CollectionItemProps> = ({ collection, index, isOpened }) => {
  const queryClient = useQueryClient();
  const handledUnavailable = useRef(false);
  const {
    data: collectionData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useCollection({ collectionId: collection.id, enabled: isOpened });
  const unavailable = isUnavailableCollectionError(error);

  useEffect(() => {
    if (!unavailable || handledUnavailable.current) return;
    handledUnavailable.current = true;
    void clearUnavailableCollection(queryClient, collection.id);
  }, [collection.id, queryClient, unavailable]);

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
                  <CollectionSharedIcon collection={collection} />
                  <Text as="span" fontWeight="medium">
                    {collection.name}
                  </Text>
                </HStack>

                <HStack gap="2" color="fg.muted" textStyle="supporting" flexWrap="wrap">
                  <CollectionSharingMeta collection={collection} />
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
            <CollectionMenu collection={collection} />
          </AbsoluteCenter>
        </Box>

        <Accordion.ItemContent>
          <Accordion.ItemBody>
            {isLoading ? (
              <CommonSpinner />
            ) : unavailable ? (
              <Stack gap="3" align="flex-start">
                <Text role="status" textStyle="body">
                  This collection is no longer available. It may have been removed by its owner or your access may have
                  changed.
                </Text>
              </Stack>
            ) : error ? (
              <ErrorState title="Error" description="Error fetching collection" onRetry={refetch} />
            ) : collectionData ? (
              <CollectionDetailsContent collection={collectionData} />
            ) : (
              <Text color="fg.muted">No collection found</Text>
            )}
          </Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
    </>
  );
};

export default CollectionItem;
