import React, { useState } from 'react';
import { Collection } from '@/features/collections/collections.types';
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import { IconButton, Menu, Portal } from '@chakra-ui/react';
import { LuEllipsis } from 'react-icons/lu';
import useDeleteCollection from '@/features/collections/api/use-delete-collection';
import useLeaveCollection from '@/features/collections/api/use-leave-collection';
import UpdateCollection from './update-collection';
import SimpleDialog from '@/components/dialogs/simple-dialog';
import CollectionSharingDialog from './collection-sharing-dialog';

interface CollectionMenuProps {
  collection: Collection;
}

const CollectionMenu: React.FC<CollectionMenuProps> = ({ collection }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const { mutateAsync: deleteCollection, isPending: isDeletingCollection } = useDeleteCollection();
  const leaveCollection = useLeaveCollection();
  const canManageSharing = collection.access?.canManageSharing !== false;
  const canLeaveCollection = collection.access?.relationship === 'member';

  const handleDeleteCollection = async () => {
    if (isDeletingCollection) return;

    await deleteCollection(collection.id);

    setIsDeleteDialogOpen(false);
  };

  const handleLeaveCollection = async () => {
    if (leaveCollection.isPending) return;

    await leaveCollection.mutateAsync(collection.id);

    setIsLeaveDialogOpen(false);
  };

  return (
    <>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Collection"
        description="Are you sure you want to delete this collection? This action cannot be undone."
        onConfirm={handleDeleteCollection}
        confirmButtonProps={{
          colorPalette: 'red',
          loading: isDeletingCollection,
        }}
      />

      <ConfirmationDialog
        isOpen={isLeaveDialogOpen}
        onOpenChange={setIsLeaveDialogOpen}
        title="Leave Collection"
        description="Are you sure you want to leave this shared collection?"
        onConfirm={handleLeaveCollection}
        confirmButtonProps={{
          colorPalette: 'red',
          loading: leaveCollection.isPending,
        }}
      />

      <SimpleDialog
        open={isUpdateDialogOpen}
        onOpenChange={(e) => {
          setIsUpdateDialogOpen(e.open);
        }}
      >
        <UpdateCollection
          collection={collection}
          onClose={() => {
            setIsUpdateDialogOpen(false);
          }}
        />
      </SimpleDialog>

      <SimpleDialog
        open={isShareDialogOpen}
        title="Share Collection"
        closeButton
        contentProps={{ maxW: { base: 'calc(100vw - 2rem)', md: '3xl' } }}
        onOpenChange={(e) => {
          setIsShareDialogOpen(e.open);
        }}
      >
        <CollectionSharingDialog collection={collection} open={isShareDialogOpen} />
      </SimpleDialog>

      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton variant="ghost" aria-label="Open Menu" title="Open Menu">
            <LuEllipsis />
          </IconButton>
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              {canManageSharing && (
                <>
                  <Menu.Item
                    value="share"
                    onClick={() => {
                      setIsShareDialogOpen(true);
                    }}
                  >
                    Share
                  </Menu.Item>

                  <Menu.Item
                    value="edit"
                    onClick={() => {
                      setIsUpdateDialogOpen(true);
                    }}
                  >
                    Edit
                  </Menu.Item>

                  <Menu.Item
                    value="delete"
                    color="fg.error"
                    _hover={{ bg: 'bg.error', color: 'fg.error' }}
                    onClick={() => {
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    Delete
                  </Menu.Item>
                </>
              )}

              {canLeaveCollection && (
                <Menu.Item
                  value="leave"
                  color="fg.error"
                  _hover={{ bg: 'bg.error', color: 'fg.error' }}
                  onClick={() => {
                    setIsLeaveDialogOpen(true);
                  }}
                >
                  Leave
                </Menu.Item>
              )}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </>
  );
};

export default CollectionMenu;
