import { Badge, Card, HStack, Stack, Text } from '@chakra-ui/react';
import { Link } from 'react-router';

import type { UpcomingEntry as UpcomingEntryModel } from '@/features/upcoming/upcoming.types';

interface UpcomingEntryProps {
  entry: UpcomingEntryModel;
}

const UpcomingEntry = ({ entry }: UpcomingEntryProps) => (
  <Card.Root as="article" variant="outline">
    <Card.Body gap="3">
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
    </Card.Body>
  </Card.Root>
);

export default UpcomingEntry;
