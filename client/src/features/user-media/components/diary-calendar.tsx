import { Box, Heading, HStack, Stack, Text } from '@chakra-ui/react';

import CalendarMonthGrid from '@/components/calendar-month-grid';
import ErrorState from '@/components/info-states/error-state';
import ListSkeleton from '@/components/loading/list-skeleton';
import type { DiaryDayBucket, DiaryResponse } from '@/features/user-media/user-media.types';
import DiaryTimeline from './diary-timeline';

const locale = typeof navigator === 'undefined' ? 'en-US' : navigator.language;
const pad = (value: number) => String(value).padStart(2, '0');
const countLabel = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const dayLabel = (date: string, bucket?: DiaryDayBucket) => {
  const label = new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00.000Z`));
  if (!bucket) return `${label}, no watches`;

  const parts = [
    `${bucket.totalEntries} ${bucket.totalEntries === 1 ? 'watch' : 'watches'}`,
    `${bucket.movieWatches} ${bucket.movieWatches === 1 ? 'movie' : 'movies'}`,
    `${bucket.episodeWatches} ${bucket.episodeWatches === 1 ? 'episode' : 'episodes'}`,
  ];
  return `${label}, ${parts.join(', ')}`;
};

interface DiaryCalendarProps {
  daily: DiaryDayBucket[];
  dayResponse?: DiaryResponse;
  isDayError?: boolean;
  isDayFetching: boolean;
  isDayLoading?: boolean;
  month: number;
  onDayPageChange: (page: number) => void;
  onDayRetry?: () => void;
  onPeriodChange: (year: number, month: number) => void;
  onSelectDate: (date: string) => void;
  selectedDate?: string;
  year: number;
}

const DiaryCalendar = ({
  daily,
  dayResponse,
  isDayError = false,
  isDayFetching,
  isDayLoading = false,
  month,
  onDayPageChange,
  onDayRetry,
  onPeriodChange,
  onSelectDate,
  selectedDate,
  year,
}: DiaryCalendarProps) => {
  const buckets = new Map(daily.map((day) => [day.date, day]));
  const monthPrefix = `${year}-${pad(month)}-`;
  const visibleDaily = daily.filter((day) => day.date.startsWith(monthPrefix));
  const totalEntries = visibleDaily.reduce((total, day) => total + day.totalEntries, 0);
  const activeDays = visibleDaily.filter((day) => day.totalEntries > 0).length;
  const monthSummary =
    totalEntries === 0
      ? 'No watches logged this month'
      : `${countLabel(totalEntries, 'watch', 'watches')} across ${countLabel(activeDays, 'day')}`;

  return (
    <Stack gap="6">
      <Stack width="full" maxW="6xl" mx="auto" gap="3">
        <CalendarMonthGrid
          getDayLabel={(date) => dayLabel(date, buckets.get(date))}
          hasContent={(date) => buckets.has(date)}
          month={month}
          onPeriodChange={onPeriodChange}
          onSelectDate={onSelectDate}
          renderDayContent={(date) => {
            const bucket = buckets.get(date);
            if (!bucket) return null;

            return (
              <Stack gap="1" mt="auto" align="start" minW="0">
                <Text display={{ base: 'block', sm: 'none' }} fontWeight="semibold" textStyle="compactLabel">
                  {bucket.totalEntries}
                </Text>
                <HStack display={{ base: 'none', sm: 'flex' }} gap="1" flexWrap="wrap">
                  {bucket.movieWatches > 0 && (
                    <Text
                      px="1.5"
                      py="0.5"
                      borderRadius="full"
                      bg="brand.subtle"
                      color="brand.fg"
                      textStyle="compactLabel"
                      whiteSpace="nowrap"
                    >
                      {countLabel(bucket.movieWatches, 'movie')}
                    </Text>
                  )}
                  {bucket.episodeWatches > 0 && (
                    <Text
                      px="1.5"
                      py="0.5"
                      borderRadius="full"
                      bg="brand.subtle"
                      color="brand.fg"
                      textStyle="compactLabel"
                      whiteSpace="nowrap"
                    >
                      {countLabel(bucket.episodeWatches, 'episode')}
                    </Text>
                  )}
                </HStack>
              </Stack>
            );
          }}
          selectedDate={selectedDate}
          summary={monthSummary}
          year={year}
        />

        <Text color="fg.muted" textStyle="supporting">
          Entries without a recorded date stay in Timeline and are not placed on the calendar.
        </Text>
      </Stack>

      {selectedDate && (
        <Box as="section">
          <Heading as="h2" textStyle="sectionTitle" mb="4">
            Selected day
          </Heading>
          {isDayLoading ? (
            <ListSkeleton label="Loading selected day" rows={2} />
          ) : isDayError ? (
            <ErrorState
              title="Selected day unavailable"
              description="Could not load watches for this day."
              onRetry={onDayRetry}
            />
          ) : dayResponse && dayResponse.data.length > 0 ? (
            <DiaryTimeline response={dayResponse} isFetching={isDayFetching} onPageChange={onDayPageChange} />
          ) : (
            <Text color="fg.muted">No watches were logged for this day.</Text>
          )}
        </Box>
      )}
    </Stack>
  );
};

export default DiaryCalendar;
