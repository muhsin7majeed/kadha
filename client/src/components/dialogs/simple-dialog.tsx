import { Dialog, DialogRootProps, Portal } from '@chakra-ui/react';

const SimpleDialog: React.FC<DialogRootProps> = (props) => {
  return (
    <Dialog.Root {...props}>
      <Portal>
        <Dialog.Backdrop />

        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Body>{props.children}</Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default SimpleDialog;
