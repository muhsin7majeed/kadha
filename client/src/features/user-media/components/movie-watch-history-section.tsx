import { Badge, Box, Button, Flex, Heading, HStack, IconButton, Skeleton, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { LuCalendar, LuEye, LuLock, LuPencil, LuPlus, LuRefreshCw, LuTrash2 } from 'react-icons/lu';

import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import { Tooltip } from '@/components/ui/tooltip';
import { formatDate } from '@/utils/date';
import useWatchEvents from '../api/use-watch-events';
import { useDeleteWatchEvent } from '../api/use-watch-event-mutations';
import type { UserMediaPayload, WatchEvent } from '../user-media.types';
import WatchEventDialog from './watch-event-dialog';

interface MovieWatchHistoryContentProps {
  media: UserMediaPayload;
  showHeading?: boolean;
}

interface MovieWatchHistorySectionProps {
  media: UserMediaPayload;
}

const getEventLabel = (watchCount: number, index: number) => {
  const viewingNumber = watchCount - index;

  return viewingNumber === 1 ? 'First watch' : `Rewatch ${viewingNumber - 1}`;
};

export const MovieWatchHistoryContent = ({ media, showHeading = true }: MovieWatchHistoryContentProps) => {
  const historyQuery = useWatchEvents('movie', media.media_id);
  const deleteEvent = useDeleteWatchEvent({ mediaId: media.media_id, mediaType: 'movie' });
  const [addOpen, setAddOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<WatchEvent | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<WatchEvent | null>(null);
  const history = historyQuery.data;
  const watchCount = history?.watchCount ?? media.watchCount ?? 0;
  const currentMedia = { ...media, watched: watchCount > 0, watchCount };

  const handleDelete = async () => {
    if (!deleteCandidate || deleteEvent.isPending) return;

    try {
      await deleteEvent.mutateAsync(deleteCandidate.id);
      setDeleteCandidate(null);
    } catch {
      return;
    }
  };

  return (
    <Stack gap="5">
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        align={{ base: 'stretch', sm: 'start' }}
        justify="space-between"
        gap="4"
      >
        <Stack gap="1">
          {showHeading && (
            <Heading as="h2" textStyle="sectionTitle">
              Watch history
            </Heading>
          )}
          <HStack gap="2" color="fg.muted">
            <LuLock aria-hidden />
            <Text textStyle="supporting">Private to you</Text>
          </HStack>
        </Stack>

        <Button colorPalette="blue" alignSelf={{ sm: 'start' }} onClick={() => setAddOpen(true)}>
          <LuPlus aria-hidden />
          {watchCount > 0 ? 'Log a rewatch' : 'Mark watched'}
        </Button>
      </Flex>

      {historyQuery.isLoading && (
        <Stack gap="3" aria-label="Loading watch history">
          <Skeleton height="20" borderRadius="lg" />
          <Skeleton height="28" borderRadius="lg" />
        </Stack>
      )}

      {historyQuery.isError && (
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          align={{ base: 'start', sm: 'center' }}
          justify="space-between"
          gap="3"
          p="4"
          borderWidth="1px"
          borderColor="border.error"
          borderRadius="lg"
          bg="bg.error"
        >
          <Text textStyle="body">Your watch history could not be loaded.</Text>
          <Button
            size="sm"
            variant="outline"
            colorPalette="gray"
            loading={historyQuery.isFetching}
            onClick={() => historyQuery.refetch()}
          >
            <LuRefreshCw aria-hidden />
            Retry
          </Button>
        </Flex>
      )}

      {history && history.watchCount === 0 && (
        <Stack
          align="center"
          textAlign="center"
          gap="3"
          py={{ base: '6', md: '8' }}
          px="4"
          bg="bg.subtle"
          borderRadius="lg"
        >
          <Box color="fg.muted" fontSize="2xl">
            <LuEye aria-hidden />
          </Box>
          <Stack gap="1">
            <Text textStyle="subsectionTitle">No watches logged yet</Text>
            <Text textStyle="supporting" color="fg.muted" maxW="md">
              Mark this movie watched to start a private history. Every rewatch can keep its own date and note.
            </Text>
          </Stack>
        </Stack>
      )}

      {history && history.watchCount > 0 && (
        <Stack gap="4">
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            gap={{ base: '3', sm: '8' }}
            p="4"
            bg="bg.subtle"
            borderRadius="lg"
          >
            <Stack gap="1">
              <Text textStyle="compactLabel" color="fg.muted">
                Times watched
              </Text>
              <Text textStyle="subsectionTitle">{history.watchCount}</Text>
            </Stack>
            <Stack gap="1">
              <Text textStyle="compactLabel" color="fg.muted">
                Latest watch
              </Text>
              <Text textStyle="subsectionTitle">
                {history.lastWatchedOn ? formatDate(history.lastWatchedOn, 'D MMMM YYYY') : 'Date not set'}
              </Text>
            </Stack>
          </Flex>

          <Stack as="ol" listStyleType="none" gap="3" aria-label="Movie watch history">
            {history.events.map((event, index) => (
              <Box
                as="li"
                key={event.id}
                p={{ base: '4', md: '5' }}
                borderWidth="1px"
                borderColor="border"
                borderRadius="lg"
                bg="bg.panel"
              >
                <Flex align="start" justify="space-between" gap="4">
                  <Stack gap="2" minW="0">
                    <HStack gap="2" flexWrap="wrap">
                      <Badge colorPalette="blue" variant="subtle">
                        {getEventLabel(history.watchCount, index)}
                      </Badge>
                      <HStack gap="1.5" color="fg.muted">
                        <LuCalendar aria-hidden />
                        <Text textStyle="supporting">
                          {event.watchedOn ? formatDate(event.watchedOn, 'D MMMM YYYY') : 'Date not set'}
                        </Text>
                      </HStack>
                    </HStack>
                    <Text
                      textStyle="body"
                      color={event.note ? 'fg' : 'fg.muted'}
                      whiteSpace="pre-wrap"
                      overflowWrap="anywhere"
                    >
                      {event.note || 'No private note for this watch.'}
                    </Text>
                  </Stack>

                  <HStack gap="1" flexShrink={0}>
                    <Tooltip content="Edit this watch" showArrow>
                      <IconButton
                        aria-label={`Edit ${getEventLabel(history.watchCount, index).toLowerCase()}`}
                        size="sm"
                        variant="ghost"
                        colorPalette="gray"
                        onClick={() => setEditEvent(event)}
                      >
                        <LuPencil aria-hidden />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content="Remove this watch" showArrow>
                      <IconButton
                        aria-label={`Remove ${getEventLabel(history.watchCount, index).toLowerCase()}`}
                        size="sm"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => setDeleteCandidate(event)}
                      >
                        <LuTrash2 aria-hidden />
                      </IconButton>
                    </Tooltip>
                  </HStack>
                </Flex>
              </Box>
            ))}
          </Stack>
        </Stack>
      )}

      <WatchEventDialog media={currentMedia} open={addOpen} onOpenChange={setAddOpen} />
      {editEvent && (
        <WatchEventDialog
          event={editEvent}
          media={currentMedia}
          open
          onOpenChange={(open) => {
            if (!open) setEditEvent(null);
          }}
        />
      )}
      <ConfirmationDialog
        isOpen={Boolean(deleteCandidate)}
        onOpenChange={(open) => {
          if (!open && !deleteEvent.isPending) setDeleteCandidate(null);
        }}
        onConfirm={handleDelete}
        title={history?.watchCount === 1 ? 'Remove your only watch?' : 'Remove this watch?'}
        description={
          history?.watchCount === 1
            ? 'This removes the movie from your watched list. Your title rating and other tracking choices stay saved.'
            : 'This viewing date and its private note will be permanently removed from your history.'
        }
        confirmButtonText="Remove watch"
        confirmButtonProps={{ colorPalette: 'red', loading: deleteEvent.isPending }}
      />
    </Stack>
  );
};

const MovieWatchHistorySection = ({ media }: MovieWatchHistorySectionProps) => (
  <Box as="section" p={{ base: '4', md: '5' }} borderWidth="1px" borderColor="border" borderRadius="xl" bg="bg.panel">
    <MovieWatchHistoryContent media={media} />
  </Box>
);

export default MovieWatchHistorySection;
