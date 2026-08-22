import { Box, Heading } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import type { MediaMeta } from '@/types/common';
import type { MediaAction, UserMediaPayload } from '../user-media.types';
import { hasActiveMediaTracking, type MediaTrackingDetailsUpdate } from '../utils/media-tracking-details';
import MediaTrackingDetails from './media-tracking-details';
import MediaTrackingDialog from './media-tracking-dialog';
import RemoveWatchedDialog from './remove-watched-dialog';

interface MediaTrackingSectionProps {
  media: UserMediaPayload;
  trackingState: MediaMeta;
}

const MediaTrackingSection = ({ media, trackingState }: MediaTrackingSectionProps) => {
  const [editAction, setEditAction] = useState<MediaAction | null>(null);
  const [removeWatchedOpen, setRemoveWatchedOpen] = useState(false);
  const [savedDetails, setSavedDetails] = useState<MediaTrackingDetailsUpdate>({});
  const currentMedia: UserMediaPayload = { ...media, ...savedDetails };
  const currentTrackingState: MediaMeta = { ...trackingState, ...savedDetails };

  useEffect(() => {
    setSavedDetails({});
  }, [media.media_id, media.media_type]);

  if (!hasActiveMediaTracking(currentTrackingState)) return null;

  return (
    <>
      <Box as="section" p={{ base: 4, md: 5 }} borderWidth="1px" borderColor="border" borderRadius="xl" bg="bg.panel">
        <Heading as="h2" textStyle="sectionTitle" mb="4">
          Your tracking
        </Heading>
        <MediaTrackingDetails
          media={currentTrackingState}
          onEdit={setEditAction}
          onRemoveWatched={() => setRemoveWatchedOpen(true)}
        />
      </Box>

      <RemoveWatchedDialog media={currentMedia} open={removeWatchedOpen} onOpenChange={setRemoveWatchedOpen} />

      {editAction && (
        <MediaTrackingDialog
          action={editAction}
          context="detail-pre-action"
          media={currentMedia}
          currentState={currentTrackingState}
          open
          onSaved={(details) => setSavedDetails((current) => ({ ...current, ...details }))}
          onOpenChange={(open) => {
            if (!open) setEditAction(null);
          }}
        />
      )}
    </>
  );
};

export default MediaTrackingSection;
