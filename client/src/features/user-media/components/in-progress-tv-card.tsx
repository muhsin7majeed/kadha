import { Badge, Box, Button, Card, HStack, Image, Progress, Stack, Text } from '@chakra-ui/react';
import { LuCheck } from 'react-icons/lu';

import MediaActions from '@/components/media-card/media-actions';
import NavLink from '@/components/nav-link';
import { toMediaCardModel } from '@/features/media/media-card-model';
import useMarkNextEpisodeWatched from '@/features/user-media/api/use-mark-next-episode-watched';
import type { TvInProgressItem } from '@/features/user-media/user-media.types';
import { tvProgressStatusLabel } from '@/features/user-media/utils/tv-progress';
import { formatDate, formatTimeAgo } from '@/utils/date';

interface InProgressTvCardProps {
  item: TvInProgressItem;
  variant?: 'page' | 'carousel';
}

const posterPlaceholder = '/assets/images/image-placeholder.svg';

const formatNextEpisodeLabel = (item: TvInProgressItem) => {
  const nextEpisode = item.tvProgress.nextEpisode;
  return nextEpisode ? `S${nextEpisode.seasonNumber} E${nextEpisode.episodeNumber}` : null;
};

const InProgressTvCard = ({ item, variant = 'page' }: InProgressTvCardProps) => {
  const markNextEpisodeWatched = useMarkNextEpisodeWatched(item.media_id);
  const nextEpisodeLabel = formatNextEpisodeLabel(item);
  const nextEpisode = item.tvProgress.nextEpisode;
  const watchedCount = item.tvProgress.watchedEpisodeCount;
  const airedCount = item.tvProgress.totalAiredEpisodeCount;
  const progressLabel = `${watchedCount} of ${airedCount} aired episodes watched`;
  const progressPercent = airedCount > 0 ? (watchedCount / airedCount) * 100 : 0;
  const detailsPath = `/app/media/tv/${item.media_id}`;
  const media = toMediaCardModel(item);
  const isPageVariant = variant === 'page';

  return (
    <Card.Root
      as="article"
      variant="outline"
      overflow="hidden"
      bg="bg.panel"
      borderColor="border"
      shadow="sm"
      width="full"
      maxW={isPageVariant ? { base: 'full', sm: '220px' } : '220px'}
      display="grid"
      gridTemplateColumns={isPageVariant ? { base: '88px minmax(0, 1fr)', sm: '1fr' } : '1fr'}
      gridTemplateRows={isPageVariant ? { base: 'auto', sm: 'auto minmax(0, 1fr)' } : 'auto minmax(0, 1fr)'}
      alignSelf="stretch"
    >
      <NavLink to={detailsPath} display="block" alignSelf="start">
        <Box position="relative" aspectRatio="2 / 3" bg="bg.subtle">
          <Image
            src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : posterPlaceholder}
            alt={`${item.title} poster`}
            onError={(event) => {
              event.currentTarget.src = posterPlaceholder;
            }}
            width="100%"
            height="100%"
            objectFit="cover"
          />
        </Box>
      </NavLink>

      <Card.Body p="3" gap="3" display="flex" flexDirection="column" minW="0">
        <HStack justify="space-between" align="start" gap="2">
          <NavLink to={detailsPath} textStyle="cardTitle" lineClamp={2} minW="0">
            {item.title} ({formatDate(item.release_date, 'YYYY')})
          </NavLink>
          <Box flexShrink="0">
            <MediaActions media={media} presentation="menu" size="xs" />
          </Box>
        </HStack>

        <Stack gap="1">
          {nextEpisode ? (
            <>
              <Text textStyle="compactLabel" lineClamp={2}>
                {nextEpisodeLabel} · {nextEpisode.name}
              </Text>
              {nextEpisode.airDate ? (
                <Text color="fg.muted" textStyle="supporting">
                  Aired {formatDate(nextEpisode.airDate)}
                </Text>
              ) : null}
            </>
          ) : (
            <>
              <Badge
                alignSelf="start"
                colorPalette={
                  item.tvProgress.status === 'completed' || item.tvProgress.status === 'caught_up'
                    ? 'green'
                    : 'blue'
                }
              >
                {tvProgressStatusLabel[item.tvProgress.status]}
              </Badge>
              <Text textStyle="compactLabel">No aired episodes left</Text>
            </>
          )}
        </Stack>

        <Stack gap="1.5">
          <Progress.Root value={progressPercent} colorPalette="brand" size="sm">
            <Progress.Track aria-label={progressLabel} aria-valuetext={progressLabel}>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Text color="fg.muted" textStyle="supporting">
            {progressLabel}
          </Text>
        </Stack>

        <Stack gap="2" mt="auto" align="start">
          {nextEpisode ? (
            <Button
              size="xs"
              colorPalette="brand"
              loading={markNextEpisodeWatched.isPending}
              loadingText={`Mark ${nextEpisodeLabel} watched`}
              onClick={() => markNextEpisodeWatched.mutate()}
            >
              <LuCheck />
              Mark {nextEpisodeLabel} watched
            </Button>
          ) : null}
          <Text color="fg.muted" textStyle="supporting">
            Watched {formatTimeAgo(item.tvProgress.lastWatchedAt)}
          </Text>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};

export default InProgressTvCard;
