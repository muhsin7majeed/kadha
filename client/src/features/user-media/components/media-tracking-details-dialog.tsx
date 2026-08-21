import { IconButton } from '@chakra-ui/react';
import type { IconButtonProps } from '@chakra-ui/react';
import { useState } from 'react';
import { LuNotebookPen } from 'react-icons/lu';

import SimpleDialog from '@/components/dialogs/simple-dialog';
import { Tooltip } from '@/components/ui/tooltip';
import type { MediaMeta } from '@/types/common';
import type { MediaAction, UserMediaPayload } from '../user-media.types';
import { hasMediaTrackingDetails } from '../utils/media-tracking-details';
import MediaTrackingDetails from './media-tracking-details';
import MediaTrackingDialog from './media-tracking-dialog';

interface MediaTrackingDetailsDialogProps {
  media: UserMediaPayload;
  size?: IconButtonProps['size'];
  trackingState: MediaMeta;
}

interface EditRequest {
  action: MediaAction;
  media: UserMediaPayload;
  trackingState: MediaMeta;
}

const MediaTrackingDetailsDialog = ({ media, size, trackingState }: MediaTrackingDetailsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [editRequest, setEditRequest] = useState<EditRequest | null>(null);

  if (!hasMediaTrackingDetails(trackingState)) return null;

  const handleEdit = (action: MediaAction) => {
    setEditRequest({ action, media, trackingState });
  };

  return (
    <>
      <Tooltip content="Personal tracking details" showArrow>
        <IconButton
          aria-label="View personal tracking details"
          title="View personal tracking details"
          size={size}
          variant="subtle"
          borderRadius="full"
          colorPalette="gray"
          onClick={() => setOpen(true)}
        >
          <LuNotebookPen />
        </IconButton>
      </Tooltip>

      <SimpleDialog
        open={open}
        onOpenChange={(details) => setOpen(details.open)}
        title="Your tracking"
        closeButton
        contentProps={{ width: { base: 'calc(100vw - 2rem)', md: 'lg' }, maxW: 'lg' }}
      >
        <MediaTrackingDetails media={trackingState} onEdit={handleEdit} />
      </SimpleDialog>

      {editRequest && (
        <MediaTrackingDialog
          action={editRequest.action}
          context="card-post-action"
          media={editRequest.media}
          currentState={editRequest.trackingState}
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setEditRequest(null);
          }}
        />
      )}
    </>
  );
};

export default MediaTrackingDetailsDialog;
