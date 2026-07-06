import {
  Badge,
  Box,
  Button,
  Center,
  Field,
  HStack,
  NativeSelect,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { LuCheck, LuExternalLink, LuListChecks } from 'react-icons/lu';
import { Link } from 'react-router';

import MediaCard from '@/components/media-card';
import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';
import PaginationControls from '@/components/pagination-controls';
import useInProgressTv from '@/features/user-media/api/use-in-progress-tv';
import useMarkNextEpisodeWatched from '@/features/user-media/api/use-mark-next-episode-watched';
import { InProgressTvSort, TvInProgressItem } from '@/features/user-media/user-media.types';
import { tvProgressStatusLabel } from '@/features/user-media/utils/tv-progress';
import { toMediaCardModel } from '@/features/media/media-card-model';
import { formatDate, formatTimeAgo } from '@/utils/date';

const getBadgePalette = (status: TvInProgressItem['tvProgress']['status']) => {
  if (status === 'caught_up' || status === 'completed') return 'green';

  return 'blue';
};

const formatNextEpisodeLabel = (item: TvInProgressItem) => {
  const nextEpisode = item.tvProgress.nextEpisode;

  if (!nextEpisode) return null;

  return `S${nextEpisode.seasonNumber} E${nextEpisode.episodeNumber}`;
};

interface InProgressTvCardProps {
  item: TvInProgressItem;
}

const InProgressTvCard = ({ item }: InProgressTvCardProps) => {
  const markNextEpisodeWatched = useMarkNextEpisodeWatched(item.media_id);
  const nextEpisodeLabel = formatNextEpisodeLabel(item);
  const nextEpisode = item.tvProgress.nextEpisode;

  return (
    <Stack gap="3" width="full" maxW="220px">
      <MediaCard media={toMediaCardModel(item)} />

      <Stack gap="3" borderWidth="1px" borderColor="border" borderRadius="md" p="3" minH="44">
        <HStack gap="2" justify="space-between" align="start">
          <Badge colorPalette={getBadgePalette(item.tvProgress.status)}>
            {tvProgressStatusLabel[item.tvProgress.status]}
          </Badge>
          <Text color="fg.muted" fontSize="xs" whiteSpace="nowrap">
            {formatTimeAgo(item.tvProgress.lastWatchedAt)}
          </Text>
        </HStack>

        <Stack gap="1" flex="1">
          {nextEpisode ? (
            <>
              <Text fontWeight="semibold" fontSize="sm">
                {nextEpisodeLabel}: {nextEpisode.name}
              </Text>
              {nextEpisode.airDate && (
                <Text color="fg.muted" fontSize="xs">
                  Aired {formatDate(nextEpisode.airDate)}
                </Text>
              )}
            </>
          ) : (
            <Text fontWeight="semibold" fontSize="sm">
              No aired episodes left
            </Text>
          )}
          <Text color="fg.muted" fontSize="xs">
            {item.tvProgress.watchedEpisodeCount} of {item.tvProgress.totalAiredEpisodeCount} aired watched
          </Text>
        </Stack>

        <HStack gap="2" flexWrap="wrap">
          {nextEpisode && (
            <Button
              size="xs"
              colorPalette="blue"
              loading={markNextEpisodeWatched.isPending}
              onClick={() => markNextEpisodeWatched.mutate()}
            >
              <LuCheck />
              Mark next
            </Button>
          )}
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

const InProgress = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<InProgressTvSort>('recent');
  const { data: inProgressTv, isLoading, isFetching, error, refetch } = useInProgressTv({ page, sort });

  return (
    <Box>
      <PageHeader
        isFetching={isFetching}
        subHeader="TV shows with episode progress, including the next aired episode when one is available."
      >
        In Progress
      </PageHeader>

      <HStack justify="flex-end" mb="5">
        <Field.Root width={{ base: 'full', sm: '64' }}>
          <Field.Label>Sort</Field.Label>
          <NativeSelect.Root disabled={isFetching}>
            <NativeSelect.Field
              value={sort}
              onChange={(event) => {
                setSort(event.currentTarget.value as InProgressTvSort);
                setPage(1);
              }}
            >
              <option value="recent">Recently watched</option>
              <option value="next">Next episode</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
      </HStack>

      {isLoading ? (
        <Center py={20}>
          <VStack gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="fg.muted">Loading your TV progress...</Text>
          </VStack>
        </Center>
      ) : error ? (
        <Box py={10}>
          <ErrorState title="Error" description="Failed to fetch in-progress shows" onRetry={refetch} />
        </Box>
      ) : inProgressTv?.data.length === 0 ? (
        <Box py={10}>
          <EmptyState
            title="No shows in progress"
            description="Episode progress from TV detail pages will appear here."
            icon={<LuListChecks />}
          />
        </Box>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6} justifyItems="center">
            {inProgressTv?.data.map((item) => (
              <InProgressTvCard key={`${item.media_type}:${item.media_id}`} item={item} />
            ))}
          </SimpleGrid>
          <PaginationControls pagination={inProgressTv?.pagination} isDisabled={isFetching} onPageChange={setPage} />
        </>
      )}
    </Box>
  );
};

export default InProgress;
