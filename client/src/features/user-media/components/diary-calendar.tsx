import { Box, Button, Flex, Grid, Heading, HStack, NativeSelect, Stack, Text } from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

import type { DiaryDayBucket, DiaryResponse } from '@/features/user-media/user-media.types';
import DiaryTimeline from './diary-timeline';

const monthNames = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat(undefined, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, index, 1))),
);
const weekdayNames = Array.from({ length: 7 }, (_, index) =>
  new Intl.DateTimeFormat(undefined, { weekday: 'short', timeZone: 'UTC' }).format(
    new Date(Date.UTC(2024, 0, 7 + index)),
  ),
);
const pad = (value: number) => String(value).padStart(2, '0');
const dateKey = (year: number, month: number, day: number) => `${year}-${pad(month)}-${pad(day)}`;
const utcCalendarDate = (year: number, monthIndex: number, day: number) => {
  const value = new Date(0);
  value.setUTCHours(0, 0, 0, 0);
  value.setUTCFullYear(year, monthIndex, day);
  return value;
};

const dayLabel = (date: string, bucket?: DiaryDayBucket) => {
  const label = new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00.000Z`),
  );
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
  isDayFetching: boolean;
  month: number;
  onDayPageChange: (page: number) => void;
  onPeriodChange: (year: number, month: number) => void;
  onSelectDate: (date: string) => void;
  selectedDate?: string;
  year: number;
}

const DiaryCalendar = ({
  daily,
  dayResponse,
  isDayFetching,
  month,
  onDayPageChange,
  onPeriodChange,
  onSelectDate,
  selectedDate,
  year,
}: DiaryCalendarProps) => {
  const firstWeekday = utcCalendarDate(year, month - 1, 1).getUTCDay();
  const dayCount = utcCalendarDate(year, month, 0).getUTCDate();
  const buckets = new Map(daily.map((day) => [day.date, day]));
  const cells = Array.from({ length: firstWeekday + dayCount }, (_, index) =>
    index < firstWeekday ? null : index - firstWeekday + 1,
  );
  while (cells.length % 7 !== 0) cells.push(null);

  const moveMonth = (offset: number) => {
    const target = utcCalendarDate(year, month - 1 + offset, 1);
    onPeriodChange(target.getUTCFullYear(), target.getUTCMonth() + 1);
  };

  return (
    <Stack gap="6">
      <Box borderWidth="1px" borderColor="border.subtle" borderRadius="xl" bg="bg.panel" overflow="hidden">
        <Flex p="4" align="center" justify="space-between" gap="3" borderBottomWidth="1px" borderColor="border.subtle">
          <Button
            aria-label="Previous month"
            variant="ghost"
            colorPalette="gray"
            size="sm"
            onClick={() => moveMonth(-1)}
          >
            <LuChevronLeft aria-hidden />
          </Button>
          <HStack gap="2">
            <NativeSelect.Root size="sm" width={{ base: '36', sm: '44' }}>
              <NativeSelect.Field
                aria-label="Calendar month"
                value={month}
                onChange={(event) => onPeriodChange(year, Number(event.currentTarget.value))}
              >
                {monthNames.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <Heading as="h2" textStyle="subsectionTitle">
              {year}
            </Heading>
          </HStack>
          <Button aria-label="Next month" variant="ghost" colorPalette="gray" size="sm" onClick={() => moveMonth(1)}>
            <LuChevronRight aria-hidden />
          </Button>
        </Flex>

        <Grid templateColumns="repeat(7, minmax(0, 1fr))" borderColor="border.subtle">
          {weekdayNames.map((name) => (
            <Text key={name} py="2" textAlign="center" color="fg.muted" textStyle="compactLabel">
              {name}
            </Text>
          ))}
          {cells.map((day, index) => {
            if (day === null) return <Box key={`blank-${index}`} minH={{ base: '14', md: '20' }} bg="bg.subtle" />;

            const date = dateKey(year, month, day);
            const bucket = buckets.get(date);
            const selected = selectedDate === date;
            return (
              <Button
                key={date}
                aria-label={dayLabel(date, bucket)}
                aria-pressed={selected}
                variant="ghost"
                colorPalette={selected ? 'blue' : 'gray'}
                borderRadius="0"
                borderTopWidth="1px"
                borderRightWidth={(index + 1) % 7 === 0 ? '0' : '1px'}
                borderColor="border.subtle"
                minH={{ base: '14', md: '20' }}
                h="auto"
                p={{ base: '1', md: '2' }}
                alignItems="stretch"
                justifyContent="flex-start"
                flexDirection="column"
                bg={selected ? 'blue.subtle' : undefined}
                onClick={() => onSelectDate(date)}
              >
                <Text alignSelf="flex-start" textStyle="compactLabel">
                  {day}
                </Text>
                {bucket && (
                  <Stack gap="0" mt="auto" align="start">
                    <Text fontWeight="semibold">{bucket.totalEntries}</Text>
                    <Text display={{ base: 'none', sm: 'block' }} color="fg.muted" textStyle="compactLabel">
                      {bucket.movieWatches}M · {bucket.episodeWatches}E
                    </Text>
                  </Stack>
                )}
              </Button>
            );
          })}
        </Grid>
      </Box>

      <Text color="fg.muted" textStyle="supporting">
        Entries without a recorded date stay in Timeline and are not placed on the calendar.
      </Text>

      {selectedDate && (
        <Box as="section">
          <Heading as="h2" textStyle="sectionTitle" mb="4">
            Selected day
          </Heading>
          {dayResponse && dayResponse.data.length > 0 ? (
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
