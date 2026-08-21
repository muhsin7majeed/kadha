import { Button, CloseButton, Dialog, Portal, Stack, Text } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router';

import CommonSpinner from '@/components/spinners/common-spinner';
import ErrorState from '@/components/info-states/error-state';
import CollectionDetailsContent from '@/features/collections/components/collection-details-content';
import useCollection from '@/features/collections/api/use-collection';
import {
  clearUnavailableCollection,
  isUnavailableCollectionError,
} from '@/features/collections/utils/collection-query-errors';

interface CollectionDetailsDialogProps {
  collectionId: string;
  collectionName: string;
  open: boolean;
  onClose: () => void;
}

const CollectionDetailsDialog = ({ collectionId, collectionName, open, onClose }: CollectionDetailsDialogProps) => {
  const queryClient = useQueryClient();
  const handledUnavailable = useRef(false);
  const collection = useCollection({ collectionId, enabled: open });
  const unavailable = isUnavailableCollectionError(collection.error);

  useEffect(() => {
    if (!open) handledUnavailable.current = false;
  }, [open]);

  useEffect(() => {
    if (!unavailable || handledUnavailable.current) return;
    handledUnavailable.current = true;
    void clearUnavailableCollection(queryClient, collectionId);
  }, [collectionId, queryClient, unavailable]);

  return (
    <Dialog.Root open={open} onOpenChange={(event) => !event.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW={{ base: 'calc(100vw - 2rem)', md: '4xl' }} maxH="calc(100vh - 2rem)">
            <Dialog.Header>
              <Dialog.Title textStyle="sectionTitle">{collection.data?.name ?? collectionName}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body overflowY="auto">
              {collection.isLoading ? (
                <CommonSpinner />
              ) : unavailable ? (
                <Stack gap="3" align="flex-start">
                  <Text role="status" textStyle="body">
                    This collection is no longer available. It may have been removed by its owner or your access may
                    have changed.
                  </Text>
                  <Button variant="outline" colorPalette="gray" onClick={onClose}>
                    Back to notifications
                  </Button>
                  <Button asChild variant="outline" colorPalette="gray">
                    <Link to="/app/collections" onClick={onClose}>
                      Go to Collections
                    </Link>
                  </Button>
                </Stack>
              ) : collection.isError ? (
                <ErrorState title="Error" description="Error fetching collection" onRetry={collection.refetch} />
              ) : collection.data ? (
                <CollectionDetailsContent collection={collection.data} />
              ) : null}
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default CollectionDetailsDialog;
