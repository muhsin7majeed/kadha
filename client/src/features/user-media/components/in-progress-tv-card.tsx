import { Badge, Button, HStack, Stack, Text } from '@chakra-ui/react';
import { LuCheck, LuExternalLink } from 'react-icons/lu';
import { Link } from 'react-router';

import MediaCard from '@/components/media-card';
import { toMediaCardModel } from '@/features/media/media-card-model';
import useMarkNextEpisodeWatched from '@/features/user-media/api/use-mark-next-episode-watched';
import type { TvInProgressItem } from '@/features/user-media/user-media.types';
import { tvProgressStatusLabel } from '@/features/user-media/utils/tv-progress';
import { formatDate, formatTimeAgo } from '@/utils/date';

const getBadgePalette = (status: TvInProgressItem['tvProgress']['status']) => {
  if (status === 'caught_up' || status === 'completed') return 'green';
  return 'blue';
};

const formatNextEpisodeLabel = (item: TvInProgressItem) => {
  const nextEpisode = item.tvProgress.nextEpisode;
  return nextEpisode ? `S${nextEpisode.seasonNumber} E${nextEpisode.episodeNumber}` : null;
};

const InProgressTvCard = ({ item }: { item: TvInProgressItem }) => {
  const markNextEpisodeWatched = useMarkNextEpisodeWatched(item.media_id);
  const nextEpisodeLabel = formatNextEpisodeLabel(item);
  const nextEpisode = item.tvProgress.nextEpisode;

  return (
    <Stack gap="3" width="full" maxW="220px" h="full">
      <MediaCard media={toMediaCardModel(item)} />

      <Stack gap="3" borderWidth="1px" borderColor="border" borderRadius="md" p="3" minH="44" flex="1">
        <HStack gap="2" justify="space-between" align="start">
          <Badge colorPalette={getBadgePalette(item.tvProgress.status)}>
            {tvProgressStatusLabel[item.tvProgress.status]}
          </Badge>
          <Text color="fg.muted" textStyle="supporting" whiteSpace="nowrap">
            {formatTimeAgo(item.tvProgress.lastWatchedAt)}
          </Text>
        </HStack>

        <Stack gap="1" flex="1">
          {nextEpisode ? (
            <>
              <Text textStyle="compactLabel">
                {nextEpisodeLabel}: {nextEpisode.name}
              </Text>
              {nextEpisode.airDate ? (
                <Text color="fg.muted" textStyle="supporting">
                  Aired {formatDate(nextEpisode.airDate)}
                </Text>
              ) : null}
            </>
          ) : (
            <Text textStyle="compactLabel">No aired episodes left</Text>
          )}
          <Text color="fg.muted" textStyle="supporting">
            {item.tvProgress.watchedEpisodeCount} of {item.tvProgress.totalAiredEpisodeCount} aired watched
          </Text>
        </Stack>

        <HStack gap="2" flexWrap="wrap">
          {nextEpisode ? (
            <Button
              size="xs"
              colorPalette="blue"
              loading={markNextEpisodeWatched.isPending}
              onClick={() => markNextEpisodeWatched.mutate()}
            >
              <LuCheck />
              Mark next
            </Button>
          ) : null}
          <Button size="xs" variant="outline" colorPalette="gray" asChild>
            <Link to={`/app/media/tv/${item.media_id}`} viewTransition>
              <LuExternalLink />
              Open
            </Link>
          </Button>
        </HStack>
      </Stack>
    </Stack>
  );
};

export default InProgressTvCard;
