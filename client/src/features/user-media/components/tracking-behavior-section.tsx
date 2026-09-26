import { Button, Card, Heading, Stack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import ListSkeleton from '@/components/loading/list-skeleton';
import SimpleCheckbox from '@/components/simple-checkbox';
import useTrackingPreferences from '../api/use-tracking-preferences';
import useUpdateTrackingPreferences from '../api/use-update-tracking-preferences';
import type { TrackingPreferences } from '../user-media.types';

const TrackingBehaviorSection = () => {
  const { data, isLoading, isError, refetch } = useTrackingPreferences();
  const { mutate: save, isPending } = useUpdateTrackingPreferences();
  const [preferences, setPreferences] = useState<TrackingPreferences | null>(null);

  useEffect(() => {
    if (data) setPreferences(data);
  }, [data]);

  if (isLoading) return <ListSkeleton label="Loading tracking behavior" rows={2} />;

  return (
    <Card.Root variant="outline">
      <Card.Header pb="3">
        <Heading as="h3" textStyle="subsectionTitle">Tracking behavior</Heading>
        <Text color="fg.muted" textStyle="supporting">These choices follow your account. Changing them does not restore titles already removed from your Watchlist.</Text>
      </Card.Header>
      <Card.Body pt="0">
        {isError || !data || !preferences ? (
          <Stack align="start" gap="2">
            <Text textStyle="body">Could not load tracking behavior.</Text>
            <Button colorPalette="gray" variant="outline" onClick={() => void refetch()}>Try again</Button>
          </Stack>
        ) : (
          <Stack gap="5">
            <Stack gap="1">
              <SimpleCheckbox label="Keep watched titles on my Watchlist" checked={preferences.keepWatchedOnWatchlist} disabled={isPending}
                onCheckedChange={(details) => setPreferences((current) => current && ({ ...current, keepWatchedOnWatchlist: details.checked === true }))} />
              <Text color="fg.muted" textStyle="supporting">Normally, changing a title’s watched status removes it from your Watchlist. Keep it there until you remove it yourself.</Text>
            </Stack>
            <Stack gap="1">
              <SimpleCheckbox label="Hide caught-up shows with nothing scheduled" checked={preferences.hideCaughtUpWithoutScheduledNext} disabled={isPending}
                onCheckedChange={(details) => setPreferences((current) => current && ({ ...current, hideCaughtUpWithoutScheduledNext: details.checked === true }))} />
              <Text color="fg.muted" textStyle="supporting">Show caught-up series in Continue Watching only when TMDB lists a dated next episode. TMDB's show summary can lag behind new episodes.</Text>
            </Stack>
            <Button colorPalette="brand" alignSelf={{ base: 'stretch', sm: 'start' }} loading={isPending}
              disabled={isPending || (preferences.keepWatchedOnWatchlist === data.keepWatchedOnWatchlist &&
                preferences.hideCaughtUpWithoutScheduledNext === data.hideCaughtUpWithoutScheduledNext)}
              onClick={() => save(preferences)}>
              Save tracking behavior
            </Button>
          </Stack>
        )}
      </Card.Body>
    </Card.Root>
  );
};

export default TrackingBehaviorSection;
