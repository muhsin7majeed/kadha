import { Badge, Box, Flex, HStack, Image, Stack, Text } from '@chakra-ui/react';
import { LuCalendarDays, LuStar } from 'react-icons/lu';
import { Link } from 'react-router';

import type { DiaryEntry as DiaryEntryData } from '@/features/user-media/user-media.types';

const formatRecordedDate = (date: string | null) => {
  if (!date) return 'Date not recorded';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(`${date}T00:00:00`));
};

const episodeLabel = (entry: DiaryEntryData) =>
  entry.media_type === 'tv' ? `S${entry.seasonNumber}E${entry.episodeNumber}` : null;

const DiaryEntry = ({ entry }: { entry: DiaryEntryData }) => (
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
        src={entry.poster_path ? `https://image.tmdb.org/t/p/w185${entry.poster_path}` : '/assets/images/image-placeholder.svg'}
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
  </Box>
);

export default DiaryEntry;
