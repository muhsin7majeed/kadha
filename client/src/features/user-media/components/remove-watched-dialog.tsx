import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import useAddToWatched from '@/features/user-media/api/use-add-to-watched';
import type { UserMediaPayload } from '@/features/user-media/user-media.types';

interface RemoveWatchedDialogProps {
  media: UserMediaPayload;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoved?: () => void;
}

const RemoveWatchedDialog = ({ media, open, onOpenChange, onRemoved }: RemoveWatchedDialogProps) => {
  const removeWatched = useAddToWatched();

  const handleConfirm = async () => {
    if (removeWatched.isPending) return;

    try {
      await removeWatched.mutateAsync({ ...media, watched: false });
      onOpenChange(false);
      onRemoved?.();
    } catch {
      return;
    }
  };

  return (
    <ConfirmationDialog
      isOpen={open}
      title="Mark this title unwatched?"
      description="This removes the title from your watched list. Its watched date, rating, and private notes will stay saved if you mark it watched again."
      confirmButtonText="Mark unwatched"
      confirmButtonProps={{
        colorPalette: 'red',
        loading: removeWatched.isPending,
      }}
      onOpenChange={onOpenChange}
      onConfirm={handleConfirm}
    />
  );
};

export default RemoveWatchedDialog;
