import { Heading, Stack, Text } from '@chakra-ui/react';

import CalendarMonthGrid from '@/components/calendar-month-grid';
import type { UpcomingEntry as UpcomingEntryModel } from '@/features/upcoming/upcoming.types';
import UpcomingEntry from './upcoming-entry';
import { formatUpcomingDate } from './upcoming-date';

const releaseCount = (entry: UpcomingEntryModel) => (entry.kind === 'episode-release' ? entry.episodes.length : 1);
const countLabel = (count: number) => `${count} ${count === 1 ? 'release' : 'releases'}`;

interface UpcomingCalendarProps {
  entries: UpcomingEntryModel[];
  minimumDate: string;
  month: number;
  onPeriodChange: (year: number, month: number) => void;
  onSelectDate: (date: string) => void;
  selectedDate?: string;
  year: number;
}

const UpcomingCalendar = ({
  entries,
  minimumDate,
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

  return (
    <Stack gap="6">
      <CalendarMonthGrid
        getDayLabel={(date) => {
          const count = counts.get(date) ?? 0;
          return `${formatUpcomingDate(date)}, ${count === 0 ? 'no releases' : countLabel(count)}`;
        }}
        hasContent={(date) => counts.has(date)}
        minimumDate={minimumDate}
        month={month}
        onPeriodChange={onPeriodChange}
        onSelectDate={onSelectDate}
        renderDayContent={(date) => {
          const count = counts.get(date);
          return count ? (
            <Text mt="auto" alignSelf="flex-start" fontWeight="semibold" textStyle="compactLabel">
              {count}
            </Text>
          ) : null;
        }}
        selectedDate={selectedDate}
        summary={summary}
        year={year}
      />

      {selectedDate && (
        <Stack as="section" gap="3">
          <Heading as="h2" textStyle="sectionTitle">
            Selected day
          </Heading>
          <Text color="fg.muted" textStyle="supporting">
            {formatUpcomingDate(selectedDate)}
          </Text>
          {selectedEntries.length > 0 ? (
            selectedEntries.map((entry) => (
              <UpcomingEntry key={`${entry.kind}:${entry.media.media_type}:${entry.media.media_id}`} entry={entry} />
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
