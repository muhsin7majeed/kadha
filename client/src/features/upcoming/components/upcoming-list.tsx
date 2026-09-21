import { Badge, Box, Button, Heading, HStack, Separator, Stack, Text } from '@chakra-ui/react';
import { Fragment, useEffect, useRef } from 'react';

import type { UpcomingEntry as UpcomingEntryModel } from '@/features/upcoming/upcoming.types';
import { formatUpcomingDate, formatUpcomingRelativeDate } from './upcoming-date';
import UpcomingEntry from './upcoming-entry';

interface UpcomingListProps {
  canLoadEarlier: boolean;
  canLoadLater: boolean;
  entries: UpcomingEntryModel[];
  isLoading: boolean;
  onLoadEarlier: () => void;
  onLoadLater: () => void;
  todayDate: string;
}

const todayAnchorId = 'upcoming-today-anchor';

const UpcomingList = ({
  canLoadEarlier,
  canLoadLater,
  entries,
  isLoading,
  onLoadEarlier,
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

  const scrollToToday = () => {
    todayAnchorRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    todayAnchorRef.current?.focus({ preventScroll: true });
  };

  const renderTodayAnchor = () => (
    <Box
      id={todayAnchorId}
      ref={todayAnchorRef}
      tabIndex={-1}
      scrollMarginTop="6"
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

  return (
    <Stack gap="7">
      <HStack justify="space-between" gap="2" flexWrap="wrap">
        <Button
          size="sm"
          variant="outline"
          colorPalette="gray"
          disabled={!canLoadEarlier || isLoading}
          onClick={onLoadEarlier}
        >
          Load earlier
        </Button>
        <Button
          size="sm"
          variant="ghost"
          colorPalette="gray"
          onClick={scrollToToday}
        >
          Jump to today
        </Button>
        <Button
          size="sm"
          variant="outline"
          colorPalette="gray"
          disabled={!canLoadLater || isLoading}
          onClick={onLoadLater}
        >
          Load later
        </Button>
      </HStack>

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
                <Heading id={`upcoming-${date}`} as="h2" textStyle="sectionTitle">
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
    </Stack>
  );
};

export default UpcomingList;
