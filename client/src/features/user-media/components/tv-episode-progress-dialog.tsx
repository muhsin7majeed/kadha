import { Box, Button, Field, HStack, NativeSelect, Skeleton, Stack, Text, chakra } from '@chakra-ui/react';
import { useEffect, useId, useMemo, useState } from 'react';

import SimpleDialog from '@/components/dialogs/simple-dialog';
import useMarkAllAiredWatched from '@/features/user-media/api/use-mark-all-aired-watched';
import useTvProgress from '@/features/user-media/api/use-tv-progress';
import useUpdateEpisodeWatch from '@/features/user-media/api/use-update-episode-watch';
import useUpdateSeasonWatch from '@/features/user-media/api/use-update-season-watch';
import { TvProgressSeason } from '@/features/user-media/user-media.types';
import { formatDate } from '@/utils/date';

interface TvEpisodeProgressDialogProps {
  initialSeasonNumber?: number;
  mediaId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getDefaultSeasonNumber = (seasons: TvProgressSeason[]) => {
  const inProgressSeason = seasons.find(
    (season) => season.airedCount > 0 && season.watchedCount < season.airedCount,
  );

  return inProgressSeason?.seasonNumber ?? seasons.find((season) => season.seasonNumber > 0)?.seasonNumber;
};

const TvEpisodeProgressDialog = ({
  initialSeasonNumber,
  mediaId,
  open,
  onOpenChange,
}: TvEpisodeProgressDialogProps) => {
  const showSpecialsId = useId();
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number | undefined>(initialSeasonNumber);
  const [includeSpecials, setIncludeSpecials] = useState(false);
  const progress = useTvProgress(mediaId, {
    enabled: open,
    seasonNumber: selectedSeasonNumber,
    includeSpecials,
  });
  const updateEpisodeWatch = useUpdateEpisodeWatch(mediaId);
  const updateSeasonWatch = useUpdateSeasonWatch(mediaId);
  const markAllAiredWatched = useMarkAllAiredWatched(mediaId);
  const selectedSeason = progress.data?.selectedSeason;
  const seasons = useMemo(() => progress.data?.seasons ?? [], [progress.data?.seasons]);
  const isMutating = updateEpisodeWatch.isPending || updateSeasonWatch.isPending || markAllAiredWatched.isPending;

  useEffect(() => {
    if (!open) return;

    setSelectedSeasonNumber(initialSeasonNumber);
  }, [initialSeasonNumber, open]);

  useEffect(() => {
    if (!open || selectedSeasonNumber !== undefined || seasons.length === 0) return;

    setSelectedSeasonNumber(getDefaultSeasonNumber(seasons));
  }, [open, seasons, selectedSeasonNumber]);

  const selectedSeasonSummary = seasons.find((season) => season.seasonNumber === selectedSeasonNumber);

  return (
    <SimpleDialog
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      title="Track episodes"
      closeButton
      contentProps={{ width: { base: 'calc(100vw - 2rem)', md: '2xl' }, maxW: '2xl' }}
      footer={
        <HStack gap="3" justify="flex-end" width="full">
          <Button variant="outline" colorPalette="gray" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </HStack>
      }
    >
      <Stack gap="5">
        <HStack gap="3" align="end" flexWrap="wrap">
          <Field.Root maxW={{ base: 'full', md: '64' }}>
            <Field.Label>Season</Field.Label>
            <NativeSelect.Root disabled={progress.isLoading || isMutating}>
              <NativeSelect.Field
                value={selectedSeasonNumber ?? ''}
                onChange={(event) => setSelectedSeasonNumber(Number(event.currentTarget.value))}
              >
                <option value="" disabled>
                  Select season
                </option>
                {seasons.map((season) => (
                  <option key={season.seasonNumber} value={season.seasonNumber}>
                    {season.name}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>

          <HStack as="label" gap="2" pb={{ md: '2' }} cursor={isMutating ? 'not-allowed' : 'pointer'}>
            <chakra.input
              id={showSpecialsId}
              type="checkbox"
              checked={includeSpecials}
              disabled={isMutating}
              width="4"
              height="4"
              accentColor="brand.solid"
              onChange={(event) => {
                setIncludeSpecials(event.currentTarget.checked);
                setSelectedSeasonNumber(undefined);
              }}
            />
            <Box as="span">Show specials</Box>
          </HStack>
        </HStack>

        <HStack gap="2" flexWrap="wrap">
          <Button
            size="sm"
            colorPalette="blue"
            disabled={!selectedSeasonNumber || selectedSeasonSummary?.airedCount === 0}
            loading={updateSeasonWatch.isPending}
            onClick={() => {
              if (selectedSeasonNumber === undefined) return;
              updateSeasonWatch.mutate({ seasonNumber: selectedSeasonNumber, watched: true });
            }}
          >
            Mark season watched
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorPalette="gray"
            disabled={!selectedSeasonNumber}
            loading={updateSeasonWatch.isPending}
            onClick={() => {
              if (selectedSeasonNumber === undefined) return;
              updateSeasonWatch.mutate({ seasonNumber: selectedSeasonNumber, watched: false });
            }}
          >
            Clear season
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorPalette="gray"
            loading={markAllAiredWatched.isPending}
            onClick={() => markAllAiredWatched.mutate()}
          >
            Mark all aired watched
          </Button>
        </HStack>

        <Stack gap="2">
          {progress.isLoading && (
            <>
              <Skeleton height="12" />
              <Skeleton height="12" />
              <Skeleton height="12" />
            </>
          )}

          {!progress.isLoading &&
            selectedSeason?.episodes.map((episode) => (
              <HStack
                key={`${episode.seasonNumber}:${episode.episodeNumber}`}
                gap="3"
                align="start"
                borderWidth="1px"
                borderColor="border"
                borderRadius="md"
                p="3"
              >
                <chakra.input
                  aria-label={`S${episode.seasonNumber} E${episode.episodeNumber} ${episode.name}`}
                  type="checkbox"
                  checked={episode.watched}
                  disabled={!episode.isAired || isMutating}
                  width="4"
                  height="4"
                  mt="1"
                  accentColor="brand.solid"
                  onChange={(event) =>
                    updateEpisodeWatch.mutate({
                      seasonNumber: episode.seasonNumber,
                      episodeNumber: episode.episodeNumber,
                      episodeId: episode.episodeId,
                      watched: event.currentTarget.checked,
                    })
                  }
                />
                <Stack gap="1" flex="1">
                  <HStack gap="2" justify="space-between" align="start">
                    <Text fontWeight="medium">
                      S{episode.seasonNumber} E{episode.episodeNumber}: {episode.name}
                    </Text>
                    {!episode.isAired && (
                      <Text color="fg.muted" fontSize="xs" whiteSpace="nowrap">
                        Unaired
                      </Text>
                    )}
                  </HStack>
                  {episode.airDate && (
                    <Text color="fg.muted" fontSize="sm">
                      {formatDate(episode.airDate)}
                    </Text>
                  )}
                </Stack>
              </HStack>
            ))}
        </Stack>
      </Stack>
    </SimpleDialog>
  );
};

export default TvEpisodeProgressDialog;
