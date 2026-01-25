import React, { useState } from 'react';
import SimpleDialog from '@/components/dialogs/simple-dialog';
import { Button, ButtonProps, IconButtonProps } from '@chakra-ui/react';
import CreateCollection from './collection-menu/create-collection';

interface CreateCollectionButtonProps {
  buttonElement?: React.ReactElement<ButtonProps | IconButtonProps>;
}

const CreateCollectionButton: React.FC<CreateCollectionButtonProps> = ({ buttonElement }) => {
  const [showCreateCollectionDialog, setShowCreateCollectionDialog] = useState(false);

  const ButtonElement = buttonElement || (
    <Button colorPalette="orange" size="sm">
      Create Collection
    </Button>
  );

  return (
    <>
      <SimpleDialog
        open={showCreateCollectionDialog}
        onOpenChange={(e) => {
          setShowCreateCollectionDialog(e.open);
        }}
      >
        <CreateCollection
          onClose={() => {
            setShowCreateCollectionDialog(false);
          }}
        />
      </SimpleDialog>

      {React.cloneElement(ButtonElement, {
        onClick: () => {
          setShowCreateCollectionDialog(true);
        },
      })}
    </>
  );
};

export default CreateCollectionButton;
