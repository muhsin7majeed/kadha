import { Badge, Box, Button, HStack, SimpleGrid, Stack, Text, VStack } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import { LuBookmark, LuCalendar, LuEye, LuHeart, LuLock, LuPencil, LuStar } from 'react-icons/lu';

import type { MediaMeta } from '@/types/common';
import { formatDate } from '@/utils/date';
import type { MediaAction } from '../user-media.types';
import { getMediaTrackingNote } from '../utils/media-tracking-details';

interface MediaTrackingDetailsProps {
  excludedActions?: MediaAction[];
  media: MediaMeta;
  onEdit: (action: MediaAction) => void;
  onRemoveWatched?: () => void;
}

interface TrackingActionConfig {
  action: MediaAction;
  colorPalette: 'red' | 'blue' | 'green';
  icon: IconType;
  label: string;
}

const trackingActions: TrackingActionConfig[] = [
  { action: 'liked', colorPalette: 'red', icon: LuHeart, label: 'Liked' },
  { action: 'watched', colorPalette: 'blue', icon: LuEye, label: 'Watched' },
  {
    action: 'watchlist',
    colorPalette: 'green',
    icon: LuBookmark,
    label: 'Watchlist',
  },
];

const getActiveActions = (media: MediaMeta) => trackingActions.filter(({ action }) => Boolean(media[action]));

const formatRating = (rating: number) => {
  const stars = rating / 2;

  return `${Number.isInteger(stars) ? stars.toFixed(0) : stars.toFixed(1)} out of 5`;
};

const MediaTrackingDetails = ({ excludedActions = [], media, onEdit, onRemoveWatched }: MediaTrackingDetailsProps) => {
  const activeActions = getActiveActions(media).filter(({ action }) => !excludedActions.includes(action));
  const showWatchedDetails = !excludedActions.includes('watched');
  const notes = activeActions
    .map((config) => ({
      ...config,
      note: getMediaTrackingNote(media, config.action),
    }))
    .filter(({ note }) => Boolean(note));
  const hasVisibleDetails =
    (media.rating != null && (media.liked || media.watched)) ||
    Boolean(showWatchedDetails && media.watched && media.watchedOn) ||
    notes.length > 0;

  return (
    <Stack gap="5">
      <HStack gap="2" color="fg.muted">
        <LuLock aria-hidden />
        <Text textStyle="supporting">Only visible to you</Text>
      </HStack>

      <HStack gap="2" flexWrap="wrap">
        {activeActions.map(({ action, colorPalette, icon: Icon, label }) => (
          <Badge key={action} colorPalette={colorPalette} variant="subtle">
            <Icon aria-hidden />
            {label}
          </Badge>
        ))}
      </HStack>

      {!hasVisibleDetails && (
        <Text textStyle="body" color="fg.muted">
          Add a rating, watched date, or private note.
        </Text>
      )}

      {(media.rating != null || (showWatchedDetails && media.watched && media.watchedOn)) && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="3">
          {media.rating != null && (media.liked || media.watched) && (
            <VStack align="start" gap="1" p="4" bg="bg.subtle" borderRadius="lg">
              <Text textStyle="compactLabel" color="fg.muted">
                Your rating
              </Text>
              <HStack gap="2" fontWeight="semibold">
                <Box color="yellow.400">
                  <LuStar aria-hidden fill="currentColor" />
                </Box>
                <Text>{formatRating(media.rating)}</Text>
              </HStack>
            </VStack>
          )}

          {showWatchedDetails && media.watched && media.watchedOn && (
            <VStack align="start" gap="1" p="4" bg="bg.subtle" borderRadius="lg">
              <Text textStyle="compactLabel" color="fg.muted">
                Watched on
              </Text>
              <HStack gap="2" fontWeight="semibold">
                <LuCalendar aria-hidden />
                <Text>{formatDate(media.watchedOn, 'D MMMM YYYY')}</Text>
              </HStack>
            </VStack>
          )}
        </SimpleGrid>
      )}

      {notes.length > 0 && (
        <Stack gap="3">
          <Text textStyle="subsectionTitle">Private notes</Text>
          {notes.map(({ action, colorPalette, icon: Icon, label, note }) => (
            <Box key={action} p="4" borderWidth="1px" borderColor="border" borderRadius="lg" bg="bg.subtle">
              <HStack gap="2" mb="2" colorPalette={colorPalette} color="colorPalette.fg">
                <Icon aria-hidden />
                <Text textStyle="compactLabel">{label}</Text>
              </HStack>
              <Text textStyle="body" whiteSpace="pre-wrap" overflowWrap="anywhere">
                {note}
              </Text>
            </Box>
          ))}
        </Stack>
      )}

      <Stack direction={{ base: 'column', sm: 'row' }} gap="2" flexWrap="wrap">
        {activeActions.map(({ action, colorPalette, label }) => (
          <Button key={action} size="sm" variant="outline" colorPalette={colorPalette} onClick={() => onEdit(action)}>
            <LuPencil aria-hidden />
            Edit {label.toLowerCase()} details
          </Button>
        ))}
        {showWatchedDetails && media.watched && onRemoveWatched && (
          <Button size="sm" variant="outline" colorPalette="red" onClick={onRemoveWatched}>
            Mark unwatched
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

export default MediaTrackingDetails;
