import { Badge, Card, HStack, Image, Stack, Text } from '@chakra-ui/react';
import { Link } from 'react-router';

import type { UpcomingEntry as UpcomingEntryModel } from '@/features/upcoming/upcoming.types';

interface UpcomingEntryProps {
  entry: UpcomingEntryModel;
}

const posterPlaceholder = '/assets/images/image-placeholder.svg';

const UpcomingEntry = ({ entry }: UpcomingEntryProps) => (
  <Card.Root as="article" variant="outline">
    <Card.Body>
      <HStack align="stretch" gap={{ base: '3', sm: '4' }}>
        <Image
          src={
            entry.media.poster_path
              ? `https://image.tmdb.org/t/p/w185${entry.media.poster_path}`
              : posterPlaceholder
          }
          alt={`${entry.media.title} poster`}
          onError={(event) => {
            event.currentTarget.src = posterPlaceholder;
          }}
          width={{ base: '14', sm: '20' }}
          aspectRatio="2 / 3"
          objectFit="cover"
          borderRadius="md"
          flexShrink="0"
        />

        <Stack gap="3" minW="0" flex="1">
          <HStack justify="space-between" align="start" gap="3">
            <Stack gap="1" minW="0">
              <Card.Title textStyle="cardTitle">
                <Link to={`/app/media/${entry.media.media_type}/${entry.media.media_id}`}>{entry.media.title}</Link>
              </Card.Title>
              <Text color="fg.muted" textStyle="supporting" lineClamp={2}>
                {entry.media.overview || 'No summary is available.'}
              </Text>
            </Stack>
            <Badge colorPalette={entry.kind === 'movie-release' ? 'purple' : 'blue'} variant="subtle" flexShrink="0">
              {entry.kind === 'movie-release' ? 'Movie' : 'TV'}
            </Badge>
          </HStack>

          {entry.kind === 'movie-release' ? (
            <Text fontWeight="medium" textStyle="body">
              Movie release
            </Text>
          ) : (
            <Stack gap="1">
              {entry.episodes.map((episode) => (
                <Text key={episode.episodeId} textStyle="body">
                  S{episode.seasonNumber} E{episode.episodeNumber} · {episode.name}
                </Text>
              ))}
            </Stack>
          )}
        </Stack>
      </HStack>
    </Card.Body>
  </Card.Root>
);

export default UpcomingEntry;
