import SimpleDialog from '@/components/dialogs/simple-dialog';
import { UserMediaPayload } from '@/features/user-media/user-media.types';
import AddToCollection from './add-to-collection';

interface AddToCollectionDialogProps {
  media: UserMediaPayload;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddToCollectionDialog = ({ media, open, onOpenChange }: AddToCollectionDialogProps) => (
  <SimpleDialog
    motionPreset="slide-in-top"
    open={open}
    onOpenChange={(details) => {
      onOpenChange(details.open);
    }}
  >
    <AddToCollection
      media={media}
      onClose={() => {
        onOpenChange(false);
      }}
    />
  </SimpleDialog>
);

export default AddToCollectionDialog;
