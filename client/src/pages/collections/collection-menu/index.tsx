import React, { useState } from 'react';
import { Collection } from '@/types/collections';
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import { IconButton, Menu, Portal } from '@chakra-ui/react';
import { LuEllipsis } from 'react-icons/lu';
import useDeleteCollection from '../apis/use-delete-collection';
import UpdateCollection from './update-collection';
import SimpleDialog from '@/components/dialogs/simple-dialog';

interface CollectionMenuProps {
  collection: Collection;
}

const CollectionMenu: React.FC<CollectionMenuProps> = ({ collection }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const { mutateAsync: deleteCollection, isPending: isDeletingCollection } = useDeleteCollection();

  const handleDeleteCollection = async () => {
    if (isDeletingCollection) return;

    await deleteCollection(collection.id);

    setIsDeleteDialogOpen(false);
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

      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton variant="ghost" aria-label="Open Menu" title="Open Menu">
            <LuEllipsis />
          </IconButton>
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content>
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
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </>
  );
};

export default CollectionMenu;
