import { CloseButton, Dialog, DialogContentProps, DialogRootProps, Portal } from '@chakra-ui/react';

interface SimpleDialogProps extends DialogRootProps {
  contentProps?: DialogContentProps;
  closeButton?: boolean;
  title?: React.ReactNode;
  trigger?: React.ReactNode;
  triggerWrapper?: (trigger: React.ReactNode) => React.ReactNode;
}

const SimpleDialog: React.FC<SimpleDialogProps> = (props) => {
  const { children, closeButton, contentProps, title, trigger, triggerWrapper, ...rootProps } = props;
  const dialogTrigger = trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null;

  return (
    <Dialog.Root {...rootProps}>
      {dialogTrigger && (triggerWrapper ? triggerWrapper(dialogTrigger) : dialogTrigger)}

      <Portal>
        <Dialog.Backdrop />

        <Dialog.Positioner>
          <Dialog.Content py="4" {...contentProps}>
            {title && (
              <Dialog.Header>
                <Dialog.Title>{title}</Dialog.Title>
              </Dialog.Header>
            )}

            <Dialog.Body>{children}</Dialog.Body>

            {closeButton && (
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default SimpleDialog;
