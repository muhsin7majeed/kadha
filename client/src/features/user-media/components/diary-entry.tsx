import { Badge, Box, Flex, HStack, IconButton, Image, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { LuCalendarDays, LuPencil, LuStar, LuTrash2 } from 'react-icons/lu';
import { Link } from 'react-router';

import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import { Tooltip } from '@/components/ui/tooltip';
import { useDeleteWatchEvent } from '@/features/user-media/api/use-watch-event-mutations';
import type { DiaryEntry as DiaryEntryData, UserMediaPayload } from '@/features/user-media/user-media.types';
import WatchEventDialog from './watch-event-dialog';

const formatRecordedDate = (date: string | null) => {
  if (!date) return 'Date not recorded';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(`${date}T00:00:00`));
};

const episodeLabel = (entry: DiaryEntryData) =>
  entry.media_type === 'tv' ? `S${entry.seasonNumber}E${entry.episodeNumber}` : null;

const toMediaPayload = (entry: DiaryEntryData): UserMediaPayload => ({
  media_id: entry.media_id,
  media_type: entry.media_type,
  title: entry.title,
  original_title: entry.original_title,
  overview: entry.overview,
  poster_path: entry.poster_path,
  backdrop_path: entry.backdrop_path,
  vote_average: entry.vote_average ?? 0,
  vote_count: entry.vote_count ?? 0,
  popularity: entry.popularity,
  adult: entry.adult ?? false,
  genre_ids: entry.genre_ids,
  release_date: entry.release_date ?? '',
  original_language: entry.original_language,
  runtime: entry.runtime,
  status: entry.status,
  rating: entry.media_type === 'movie' ? entry.rating : undefined,
});

const DiaryEntry = ({ entry }: { entry: DiaryEntryData }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteEvent = useDeleteWatchEvent({ mediaId: entry.media_id, mediaType: entry.media_type });
  const media = toMediaPayload(entry);

  const handleDelete = async () => {
    try {
      await deleteEvent.mutateAsync(entry.id);
      setDeleteOpen(false);
    } catch {
      return;
    }
  };

  return (
    <Box as="li">
      <Flex
        as="article"
        gap={{ base: '3', md: '4' }}
        p={{ base: '3', md: '4' }}
        borderWidth="1px"
        borderColor="border.subtle"
        borderRadius="lg"
        bg="bg.panel"
        align="start"
      >
        <Image
          src={
            entry.poster_path
              ? `https://image.tmdb.org/t/p/w185${entry.poster_path}`
              : '/assets/images/image-placeholder.svg'
          }
          alt=""
          w={{ base: '16', md: '20' }}
          aspectRatio="2/3"
          objectFit="cover"
          borderRadius="md"
          flexShrink={0}
          onError={(event) => {
            event.currentTarget.src = '/assets/images/image-placeholder.svg';
          }}
        />

        <Stack gap="2" minW="0" flex="1">
          <Flex justify="space-between" align="start" gap="2">
            <HStack gap="2" flexWrap="wrap">
              <Badge colorPalette={entry.media_type === 'movie' ? 'blue' : 'purple'} variant="subtle">
                {entry.media_type === 'movie' ? 'Movie' : episodeLabel(entry)}
              </Badge>
              {entry.rating !== null && (
                <HStack gap="1" color="fg.muted" aria-label={`${entry.rating} out of 10 rating`}>
                  <LuStar aria-hidden />
                  <Text textStyle="supporting">{entry.rating}/10</Text>
                </HStack>
              )}
            </HStack>
            <HStack gap="1" flexShrink={0}>
              <Tooltip content="Edit this diary entry" showArrow>
                <IconButton
                  aria-label={`Edit ${entry.title} diary entry`}
                  size="sm"
                  variant="ghost"
                  colorPalette="gray"
                  onClick={() => setEditOpen(true)}
                >
                  <LuPencil aria-hidden />
                </IconButton>
              </Tooltip>
              <Tooltip content="Remove this diary entry" showArrow>
                <IconButton
                  aria-label={`Remove ${entry.title} diary entry`}
                  size="sm"
                  variant="ghost"
                  colorPalette="red"
                  onClick={() => setDeleteOpen(true)}
                >
                  <LuTrash2 aria-hidden />
                </IconButton>
              </Tooltip>
            </HStack>
          </Flex>

          <Link to={`/app/media/${entry.media_type}/${entry.media_id}`}>
            <Text textStyle="cardTitle" fontWeight="semibold" lineClamp={2} _hover={{ textDecoration: 'underline' }}>
              {entry.title}
            </Text>
          </Link>

          <HStack gap="1.5" color="fg.muted">
            <LuCalendarDays aria-hidden />
            <Text textStyle="supporting">{formatRecordedDate(entry.watchedOn)}</Text>
          </HStack>

          {entry.rating !== null && entry.media_type === 'movie' && (
            <Text color="fg.muted" textStyle="supporting">
              Current title rating
            </Text>
          )}

          <Text color={entry.note ? 'fg' : 'fg.muted'} textStyle="body" whiteSpace="pre-wrap" overflowWrap="anywhere">
            {entry.note || 'No private note for this watch.'}
          </Text>
        </Stack>
      </Flex>

      <WatchEventDialog event={entry} media={media} open={editOpen} onOpenChange={setEditOpen} />
      <ConfirmationDialog
        isOpen={deleteOpen}
        onOpenChange={(open) => {
          if (!deleteEvent.isPending) setDeleteOpen(open);
        }}
        onConfirm={handleDelete}
        title="Remove this diary entry?"
        description="This watch will be removed from your private history. Other watches for this title stay intact."
        confirmButtonText="Remove watch"
        confirmButtonProps={{ colorPalette: 'red', loading: deleteEvent.isPending }}
      />
    </Box>
  );
};

export default DiaryEntry;
