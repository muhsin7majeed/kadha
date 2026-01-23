import { Dialog, DialogContentProps, DialogRootProps, Portal } from '@chakra-ui/react';

interface SimpleDialogProps extends DialogRootProps {
  contentProps?: DialogContentProps;
}

const SimpleDialog: React.FC<SimpleDialogProps> = (props) => {
  return (
    <Dialog.Root {...props}>
      <Portal>
        <Dialog.Backdrop />

        <Dialog.Positioner>
          <Dialog.Content py="4" {...props.contentProps}>
            <Dialog.Body>{props.children}</Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default SimpleDialog;
