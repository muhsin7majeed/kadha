import { Badge, Box, Button, HStack, Skeleton, Stack, Text } from '@chakra-ui/react';
import { LuCheck, LuListChecks } from 'react-icons/lu';

import { TvProgressResponse } from '../user-media.types';
import { getNextEpisodeLabel, tvProgressStatusLabel } from '../utils/tv-progress';

interface TvProgressSummaryProps {
  progress?: TvProgressResponse;
  isLoading?: boolean;
  isMarkingNext?: boolean;
  onMarkNext: () => void;
  onTrackEpisodes: () => void;
}

const getBadgePalette = (status: TvProgressResponse['status']) => {
  if (status === 'caught_up' || status === 'completed') return 'green';
  if (status === 'in_progress') return 'blue';
  if (status === 'plan_to_watch') return 'purple';

  return 'gray';
};

const TvProgressSummary = ({
  progress,
  isLoading,
  isMarkingNext,
  onMarkNext,
  onTrackEpisodes,
}: TvProgressSummaryProps) => {
  if (isLoading) {
    return (
      <Stack gap="3">
        <Skeleton height="7" width="40" />
        <Skeleton height="5" width="64" />
        <Skeleton height="10" width={{ base: 'full', sm: '72' }} />
      </Stack>
    );
  }

  if (!progress) return null;

  const nextEpisodeLabel = getNextEpisodeLabel(progress);
  const percent =
    progress.totalAiredEpisodeCount > 0
      ? Math.round((progress.watchedEpisodeCount / progress.totalAiredEpisodeCount) * 100)
      : 0;

  return (
    <Stack gap="4">
      <HStack justify="space-between" align="start" gap="4" flexWrap="wrap">
        <Stack gap="1">
          <HStack gap="2" flexWrap="wrap">
            <Text fontWeight="semibold">Your progress</Text>
            <Badge colorPalette={getBadgePalette(progress.status)}>{tvProgressStatusLabel[progress.status]}</Badge>
          </HStack>
          <Text color="fg.muted" fontSize="sm">
            {nextEpisodeLabel && progress.nextEpisode
              ? `${nextEpisodeLabel} next: ${progress.nextEpisode.name}`
              : progress.watchedEpisodeCount > 0
                ? 'No aired episodes left to watch'
                : 'No episodes watched yet'}
          </Text>
          <Text color="fg.muted" fontSize="sm">
            {progress.watchedEpisodeCount} of {progress.totalAiredEpisodeCount} aired episodes watched
          </Text>
        </Stack>

        <HStack gap="2" flexWrap="wrap">
          {progress.nextEpisode && (
            <Button size="sm" colorPalette="blue" onClick={onMarkNext} loading={isMarkingNext}>
              <LuCheck />
              Mark next
            </Button>
          )}
          <Button size="sm" variant="outline" colorPalette="gray" onClick={onTrackEpisodes}>
            <LuListChecks />
            Track episodes
          </Button>
        </HStack>
      </HStack>

      <Box
        role="progressbar"
        aria-label="TV progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        height="2"
        borderRadius="full"
        bg="bg.subtle"
        overflow="hidden"
      >
        <Box height="full" width={`${percent}%`} bg="blue.solid" />
      </Box>
    </Stack>
  );
};

export default TvProgressSummary;
