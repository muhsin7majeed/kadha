import { Button, ButtonProps, CloseButton, Dialog, Portal } from '@chakra-ui/react';

interface ConfirmationDialogProps {
  title: string;
  description?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isOpen: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  confirmButtonProps?: ButtonProps;
}
const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  title = 'Are you sure?',
  description,
  onConfirm,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  isOpen,
  confirmButtonProps,
  onOpenChange,
}) => {
  return (
    <Dialog.Root
      role="alertdialog"
      open={isOpen}
      onOpenChange={(e) => {
        onOpenChange(e.open);
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>

            {description && (
              <Dialog.Body>
                <p>{description}</p>
              </Dialog.Body>
            )}

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                  }}
                >
                  {cancelButtonText}
                </Button>
              </Dialog.ActionTrigger>

              <Button {...confirmButtonProps} onClick={onConfirm}>
                {confirmButtonText}
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ConfirmationDialog;
