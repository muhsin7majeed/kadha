import { Badge, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';

import CalendarMonthGrid from '@/components/calendar-month-grid';
import type { UpcomingEntry as UpcomingEntryModel } from '@/features/upcoming/upcoming.types';
import UpcomingEntry from './upcoming-entry';
import { formatUpcomingDate, formatUpcomingRelativeDate } from './upcoming-date';

const releaseCount = (entry: UpcomingEntryModel) => (entry.kind === 'episode-release' ? entry.episodes.length : 1);
const countLabel = (count: number) => `${count} ${count === 1 ? 'release' : 'releases'}`;

interface UpcomingCalendarProps {
  entries: UpcomingEntryModel[];
  minimumDate: string;
  maximumDate: string;
  todayDate: string;
  month: number;
  onPeriodChange: (year: number, month: number) => void;
  onSelectDate: (date: string) => void;
  selectedDate?: string;
  year: number;
}

const UpcomingCalendar = ({
  entries,
  minimumDate,
  maximumDate,
  todayDate,
  month,
  onPeriodChange,
  onSelectDate,
  selectedDate,
  year,
}: UpcomingCalendarProps) => {
  const entriesByDate = new Map<string, UpcomingEntryModel[]>();

  for (const entry of entries) {
    const datedEntries = entriesByDate.get(entry.date) ?? [];
    datedEntries.push(entry);
    entriesByDate.set(entry.date, datedEntries);
  }

  const counts = new Map(
    [...entriesByDate.entries()].map(([date, datedEntries]) => [
      date,
      datedEntries.reduce((total, entry) => total + releaseCount(entry), 0),
    ]),
  );
  const totalReleases = [...counts.values()].reduce((total, count) => total + count, 0);
  const summary = totalReleases === 0 ? 'Nothing scheduled this month' : `${countLabel(totalReleases)} this month`;
  const selectedEntries = selectedDate ? entriesByDate.get(selectedDate) ?? [] : [];
  const selectedDayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedDate) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    selectedDayRef.current?.scrollIntoView?.({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'nearest',
    });
  }, [selectedDate]);

  return (
    <Stack gap="6">
      <CalendarMonthGrid
        getDayLabel={(date) => {
          const count = counts.get(date) ?? 0;
          return `${formatUpcomingDate(date)}, ${count === 0 ? 'no releases' : countLabel(count)}`;
        }}
        hasContent={(date) => counts.has(date)}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        month={month}
        onPeriodChange={onPeriodChange}
        onSelectDate={onSelectDate}
        renderDayContent={(date) => {
          const count = counts.get(date);
          const datedEntries = entriesByDate.get(date) ?? [];
          const firstEntry = datedEntries[0];
          const additionalTitles = datedEntries.length - 1;

          return count && firstEntry ? (
            <Stack mt="auto" gap="0.5" width="full" minW="0" align="stretch">
              <Text
                display={{ base: 'none', sm: 'block' }}
                textAlign="left"
                textStyle="compactLabel"
                lineClamp={1}
                title={firstEntry.media.title}
              >
                {firstEntry.media.title}
              </Text>
              <HStack justify="space-between" gap="1">
                <Text fontWeight="semibold" textStyle="compactLabel">
                  {count}
                </Text>
                {additionalTitles > 0 && (
                  <Text
                    display={{ base: 'none', sm: 'block' }}
                    color="fg.muted"
                    textStyle="compactLabel"
                    minW="0"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    title={`+${additionalTitles} more`}
                  >
                    +{additionalTitles} more
                  </Text>
                )}
              </HStack>
            </Stack>
          ) : null;
        }}
        selectedDate={selectedDate}
        summary={summary}
        year={year}
      />

      {selectedDate && (
        <Stack
          ref={selectedDayRef}
          as="section"
          gap="3"
          scrollMarginTop="6rem"
        >
          <Heading as="h2" textStyle="sectionTitle">
            Selected day
          </Heading>
          <HStack gap="2" flexWrap="wrap">
            <Text color="fg.muted" textStyle="supporting">
              {formatUpcomingDate(selectedDate)}
            </Text>
            <Badge colorPalette="gray" variant="subtle">
              {formatUpcomingRelativeDate(selectedDate, todayDate)}
            </Badge>
          </HStack>
          {selectedEntries.length > 0 ? (
            selectedEntries.map((entry) => (
              <UpcomingEntry
                key={`${entry.kind}:${entry.media.media_type}:${entry.media.media_id}`}
                entry={entry}
                todayDate={todayDate}
              />
            ))
          ) : (
            <Text color="fg.muted">Nothing is scheduled for this day.</Text>
          )}
        </Stack>
      )}
    </Stack>
  );
};

export default UpcomingCalendar;
