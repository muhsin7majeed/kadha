import { Box, Heading } from '@chakra-ui/react';
import { useState } from 'react';

import type { MediaMeta } from '@/types/common';
import type { MediaAction, UserMediaPayload } from '../user-media.types';
import { hasMediaTrackingDetails } from '../utils/media-tracking-details';
import MediaTrackingDetails from './media-tracking-details';
import MediaTrackingDialog from './media-tracking-dialog';

interface MediaTrackingSectionProps {
  media: UserMediaPayload;
  trackingState: MediaMeta;
}

const MediaTrackingSection = ({ media, trackingState }: MediaTrackingSectionProps) => {
  const [editAction, setEditAction] = useState<MediaAction | null>(null);

  if (!hasMediaTrackingDetails(trackingState)) return null;

  return (
    <>
      <Box as="section" p={{ base: 4, md: 5 }} borderWidth="1px" borderColor="border" borderRadius="xl" bg="bg.panel">
        <Heading as="h2" textStyle="sectionTitle" mb="4">
          Your tracking
        </Heading>
        <MediaTrackingDetails media={trackingState} onEdit={setEditAction} />
      </Box>

      {editAction && (
        <MediaTrackingDialog
          action={editAction}
          context="detail-pre-action"
          media={media}
          currentState={trackingState}
          open
          onOpenChange={(open) => {
            if (!open) setEditAction(null);
          }}
        />
      )}
    </>
  );
};

export default MediaTrackingSection;
