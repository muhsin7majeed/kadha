import { IconButton } from '@chakra-ui/react';
import type { IconButtonProps } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { LuNotebookPen } from 'react-icons/lu';

import SimpleDialog from '@/components/dialogs/simple-dialog';
import { Tooltip } from '@/components/ui/tooltip';
import type { MediaMeta } from '@/types/common';
import type { MediaAction, UserMediaPayload } from '../user-media.types';
import { hasActiveMediaTracking, type MediaTrackingDetailsUpdate } from '../utils/media-tracking-details';
import MediaTrackingDetails from './media-tracking-details';
import MediaTrackingDialog from './media-tracking-dialog';
import RemoveWatchedDialog from './remove-watched-dialog';

interface MediaTrackingDetailsDialogProps {
  excludedActions?: MediaAction[];
  media: UserMediaPayload;
  onOpenChange?: (open: boolean) => void;
  onSaved?: (details: MediaTrackingDetailsUpdate) => void;
  open?: boolean;
  showTrigger?: boolean;
  size?: IconButtonProps['size'];
  trackingState: MediaMeta;
}

interface EditRequest {
  action: MediaAction;
  media: UserMediaPayload;
  trackingState: MediaMeta;
}

const MediaTrackingDetailsDialog = ({
  media,
  excludedActions = [],
  onOpenChange,
  onSaved,
  open: controlledOpen,
  showTrigger = true,
  size,
  trackingState,
}: MediaTrackingDetailsDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [editRequest, setEditRequest] = useState<EditRequest | null>(null);
  const [removeWatchedOpen, setRemoveWatchedOpen] = useState(false);
  const [savedDetails, setSavedDetails] = useState<MediaTrackingDetailsUpdate>({});
  const open = controlledOpen ?? internalOpen;
  const currentMedia: UserMediaPayload = { ...media, ...savedDetails };
  const currentTrackingState: MediaMeta = { ...trackingState, ...savedDetails };
  const setOpen = (nextOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    setSavedDetails({});
  }, [media.media_id, media.media_type]);

  const hasVisibleTracking =
    Boolean(
      (currentTrackingState.liked && !excludedActions.includes('liked')) ||
      (currentTrackingState.watched && !excludedActions.includes('watched')) ||
      (currentTrackingState.watchlist && !excludedActions.includes('watchlist')),
    ) || currentTrackingState.rating != null;

  if (!hasActiveMediaTracking(currentTrackingState) || !hasVisibleTracking) return null;

  const handleEdit = (action: MediaAction) => {
    setOpen(false);
    setEditRequest({ action, media: currentMedia, trackingState: currentTrackingState });
  };

  const handleSaved = (details: MediaTrackingDetailsUpdate) => {
    setSavedDetails((current) => ({ ...current, ...details }));
    onSaved?.(details);
  };

  return (
    <>
      {showTrigger && (
        <Tooltip content="Manage personal tracking" showArrow>
          <IconButton
            aria-label="Manage personal tracking"
            title="Manage personal tracking"
            size={size}
            variant="subtle"
            borderRadius="full"
            colorPalette="gray"
            onClick={() => setOpen(true)}
          >
            <LuNotebookPen />
          </IconButton>
        </Tooltip>
      )}

      <SimpleDialog
        open={open}
        onOpenChange={(details) => setOpen(details.open)}
        title="Your tracking"
        closeButton
        contentProps={{
          width: { base: 'calc(100vw - 2rem)', md: 'lg' },
          maxW: 'lg',
        }}
      >
        <MediaTrackingDetails
          excludedActions={excludedActions}
          media={currentTrackingState}
          onEdit={handleEdit}
          onRemoveWatched={
            excludedActions.includes('watched')
              ? undefined
              : () => {
                  setOpen(false);
                  setRemoveWatchedOpen(true);
                }
          }
        />
      </SimpleDialog>

      <RemoveWatchedDialog
        media={currentMedia}
        open={removeWatchedOpen}
        onOpenChange={(nextOpen) => {
          setRemoveWatchedOpen(nextOpen);
          if (!nextOpen) setOpen(true);
        }}
        onRemoved={() => setOpen(false)}
      />

      {editRequest && (
        <MediaTrackingDialog
          action={editRequest.action}
          context="card-post-action"
          media={editRequest.media}
          currentState={editRequest.trackingState}
          open
          onSaved={handleSaved}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setEditRequest(null);
              setOpen(true);
            }
          }}
        />
      )}
    </>
  );
};

export default MediaTrackingDetailsDialog;
