import { CloseButton, Dialog, DialogBodyProps, DialogContentProps, DialogRootProps, Portal } from '@chakra-ui/react';

interface SimpleDialogProps extends DialogRootProps {
  bodyProps?: DialogBodyProps;
  contentProps?: DialogContentProps;
  closeButton?: boolean;
  footer?: React.ReactNode;
  title?: React.ReactNode;
  trigger?: React.ReactNode;
  triggerWrapper?: (trigger: React.ReactNode) => React.ReactNode;
}

const SimpleDialog: React.FC<SimpleDialogProps> = (props) => {
  const { bodyProps, children, closeButton, contentProps, footer, title, trigger, triggerWrapper, ...rootProps } = props;
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

            <Dialog.Body {...bodyProps}>{children}</Dialog.Body>

            {footer && <Dialog.Footer>{footer}</Dialog.Footer>}

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
