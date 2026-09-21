import { Badge, Box, Button, Heading, HStack, Separator, Stack, Text } from '@chakra-ui/react';
import { Fragment, useEffect, useRef } from 'react';
import { LuChevronDown, LuChevronUp } from 'react-icons/lu';

import type { UpcomingEntry as UpcomingEntryModel } from '@/features/upcoming/upcoming.types';
import { formatUpcomingDate, formatUpcomingMonth, formatUpcomingRelativeDate } from './upcoming-date';
import UpcomingEntry from './upcoming-entry';

interface UpcomingListProps {
  canLoadEarlier: boolean;
  canLoadLater: boolean;
  emptyLoad?: { direction: 'earlier' | 'later'; monthKey: string };
  entries: UpcomingEntryModel[];
  isLoading: boolean;
  loadingDirection?: 'earlier' | 'later';
  onLoadEarlier: () => void;
  scrollTargetDate?: string;
  onLoadLater: () => void;
  todayDate: string;
}

const UpcomingList = ({
  canLoadEarlier,
  canLoadLater,
  emptyLoad,
  entries,
  isLoading,
  loadingDirection,
  onLoadEarlier,
  scrollTargetDate,
  onLoadLater,
  todayDate,
}: UpcomingListProps) => {
  const todayAnchorRef = useRef<HTMLDivElement>(null);
  const entriesByDate = new Map<string, UpcomingEntryModel[]>();

  for (const entry of entries) {
    const datedEntries = entriesByDate.get(entry.date) ?? [];
    datedEntries.push(entry);
    entriesByDate.set(entry.date, datedEntries);
  }

  const dates = [...entriesByDate.keys()].sort((left, right) => left.localeCompare(right));
  const todayIndex = dates.findIndex((date) => date >= todayDate);

  useEffect(() => {
    todayAnchorRef.current?.scrollIntoView?.({ block: 'start' });
  }, []);

  useEffect(() => {
    if (!scrollTargetDate) return;

    document.getElementById(`upcoming-${scrollTargetDate}`)?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'start',
    });
  }, [scrollTargetDate]);

  const scrollToToday = () => {
    todayAnchorRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    todayAnchorRef.current?.focus({ preventScroll: true });
  };

  const renderEmptyLoadMessage = (direction: 'earlier' | 'later') => {
    if (emptyLoad?.direction !== direction) return null;

    return (
      <Text color="fg.muted" textAlign="center" textStyle="supporting" aria-live="polite">
        No dates found in {formatUpcomingMonth(emptyLoad.monthKey)}. More dates may still be available in other months.
      </Text>
    );
  };

  const renderTodayAnchor = () => (
    <Box
      id="upcoming-today-anchor"
      ref={todayAnchorRef}
      tabIndex={-1}
      scrollMarginTop="20"
      outline="none"
      aria-label="Today"
    >
      <HStack gap="3">
        <Separator flex="1" />
        <Text color="fg.muted" textStyle="compactLabel" fontWeight="semibold">
          Today
        </Text>
        <Separator flex="1" />
      </HStack>
    </Box>
  );

  const renderLoadMoreButton = (direction: 'earlier' | 'later') => {
    const isEarlier = direction === 'earlier';
    const canLoad = isEarlier ? canLoadEarlier : canLoadLater;

    return (
      <Button
        alignSelf="center"
        size="sm"
        variant="ghost"
        colorPalette="gray"
        aria-label={isEarlier ? 'Load earlier dates' : 'Load later dates'}
        disabled={!canLoad || isLoading}
        loading={loadingDirection === direction}
        onClick={isEarlier ? onLoadEarlier : onLoadLater}
      >
        {isEarlier ? <LuChevronUp aria-hidden /> : null}
        Load more
        {!isEarlier ? <LuChevronDown aria-hidden /> : null}
      </Button>
    );
  };

  return (
    <Stack gap="7">
      <Box position="sticky" top="4" zIndex="1" display="flex" justifyContent="flex-end" pointerEvents="none">
        <Button
          size="sm"
          variant="outline"
          colorPalette="gray"
          borderRadius="full"
          shadow="sm"
          pointerEvents="auto"
          onClick={scrollToToday}
        >
          Today
        </Button>
      </Box>

      {renderLoadMoreButton('earlier')}
      {renderEmptyLoadMessage('earlier')}
      {dates.length === 0 && (
        <Text color="fg.muted" textAlign="center">
          Nothing scheduled
        </Text>
      )}
      {dates.map((date, index) => {
        const datedEntries = entriesByDate.get(date) ?? [];

        return (
          <Fragment key={date}>
            {index === todayIndex && renderTodayAnchor()}
            <Stack as="section" gap="3" aria-labelledby={`upcoming-${date}`}>
              <HStack gap="2" flexWrap="wrap">
                <Heading id={`upcoming-${date}`} as="h2" textStyle="sectionTitle" scrollMarginTop="20">
                  {formatUpcomingDate(date)}
                </Heading>
                <Badge colorPalette="gray" variant="subtle">
                  {formatUpcomingRelativeDate(date, todayDate)}
                </Badge>
              </HStack>
              <Stack gap="3">
                {datedEntries.map((entry) => (
                  <UpcomingEntry
                    key={`${entry.kind}:${entry.media.media_type}:${entry.media.media_id}:${entry.date}`}
                    entry={entry}
                    todayDate={todayDate}
                  />
                ))}
              </Stack>
            </Stack>
          </Fragment>
        );
      })}
      {todayIndex === -1 || todayIndex === dates.length ? renderTodayAnchor() : null}
      {renderEmptyLoadMessage('later')}
      {renderLoadMoreButton('later')}
    </Stack>
  );
};

export default UpcomingList;
