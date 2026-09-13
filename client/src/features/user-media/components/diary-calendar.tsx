import { DatePicker, type DateValue } from '@ark-ui/react/date-picker';
import { parseDate } from '@internationalized/date';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  NativeSelect,
  Stack,
  Text,
  chakra,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

import type {
  DiaryDayBucket,
  DiaryResponse,
} from '@/features/user-media/user-media.types';
import DiaryTimeline from './diary-timeline';

const locale = typeof navigator === 'undefined' ? 'en-US' : navigator.language;
const monthNames = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(2024, index, 1)),
  ),
);
const pad = (value: number) => String(value).padStart(2, '0');
const dateKey = (year: number, month: number, day: number) =>
  `${year}-${pad(month)}-${pad(day)}`;

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
  const periodStart = dateKey(year, month, 1);
  const [focusedValue, setFocusedValue] = useState<DateValue>(() =>
    parseDate(
      selectedDate?.startsWith(`${year}-${pad(month)}-`)
        ? selectedDate
        : periodStart,
    ),
  );
  const buckets = new Map(daily.map((day) => [day.date, day]));

  useEffect(() => {
    setFocusedValue(
      parseDate(
        selectedDate?.startsWith(`${year}-${pad(month)}-`)
          ? selectedDate
          : periodStart,
      ),
    );
  }, [month, periodStart, selectedDate, year]);

  const handleFocusChange = (nextFocusedValue: DateValue) => {
    setFocusedValue(nextFocusedValue);
    if (nextFocusedValue.year !== year || nextFocusedValue.month !== month) {
      onPeriodChange(nextFocusedValue.year, nextFocusedValue.month);
    }
  };

  return (
    <Stack gap="6">
      <Box
        borderWidth="1px"
        borderColor="border.subtle"
        borderRadius="xl"
        bg="bg.panel"
        overflow="hidden"
      >
        <DatePicker.Root
          open
          closeOnSelect={false}
          locale={locale}
          timeZone="UTC"
          focusedValue={focusedValue}
          value={selectedDate ? [parseDate(selectedDate)] : []}
          onFocusChange={(details) => handleFocusChange(details.focusedValue)}
          onValueChange={(details) => {
            const date = details.value[0];
            if (date) onSelectDate(date.toString());
          }}
        >
          <DatePicker.Content asChild>
            <Box>
              <DatePicker.View view="day" asChild>
                <Box>
                  <DatePicker.ViewControl asChild>
                    <Flex
                      p="4"
                      align="center"
                      justify="space-between"
                      gap="3"
                      borderBottomWidth="1px"
                      borderColor="border.subtle"
                    >
                      <DatePicker.PrevTrigger asChild>
                        <Button
                          aria-label="Previous month"
                          variant="ghost"
                          colorPalette="gray"
                          size="sm"
                        >
                          <LuChevronLeft aria-hidden />
                        </Button>
                      </DatePicker.PrevTrigger>
                      <HStack gap="2">
                        <NativeSelect.Root
                          size="sm"
                          width={{ base: '36', sm: '44' }}
                        >
                          <NativeSelect.Field
                            aria-label="Calendar month"
                            value={month}
                            onChange={(event) =>
                              onPeriodChange(
                                year,
                                Number(event.currentTarget.value),
                              )
                            }
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
                      <DatePicker.NextTrigger asChild>
                        <Button
                          aria-label="Next month"
                          variant="ghost"
                          colorPalette="gray"
                          size="sm"
                        >
                          <LuChevronRight aria-hidden />
                        </Button>
                      </DatePicker.NextTrigger>
                    </Flex>
                  </DatePicker.ViewControl>

                  <DatePicker.Context>
                    {(api) => (
                      <DatePicker.Table asChild>
                        <chakra.table
                          width="full"
                          tableLayout="fixed"
                          borderCollapse="collapse"
                        >
                          <DatePicker.TableHead asChild>
                            <chakra.thead>
                              <DatePicker.TableRow asChild>
                                <chakra.tr>
                                  {api.weekDays.map((weekDay) => (
                                    <DatePicker.TableHeader
                                      key={weekDay.value.toString()}
                                      asChild
                                    >
                                      <chakra.th
                                        py="2"
                                        textAlign="center"
                                        color="fg.muted"
                                        textStyle="compactLabel"
                                        fontWeight="normal"
                                      >
                                        <chakra.span aria-hidden>
                                          {weekDay.short}
                                        </chakra.span>
                                        <chakra.span srOnly>
                                          {weekDay.long}
                                        </chakra.span>
                                      </chakra.th>
                                    </DatePicker.TableHeader>
                                  ))}
                                </chakra.tr>
                              </DatePicker.TableRow>
                            </chakra.thead>
                          </DatePicker.TableHead>
                          <DatePicker.TableBody asChild>
                            <chakra.tbody>
                              {api.weeks.map((week, weekIndex) => (
                                <DatePicker.TableRow key={weekIndex} asChild>
                                  <chakra.tr>
                                    {week.map((day, dayIndex) => {
                                      const cellState =
                                        api.getDayTableCellState({
                                          value: day,
                                          visibleRange: api.visibleRange,
                                        });
                                      const date = day.toString();
                                      const bucket = buckets.get(date);

                                      return (
                                        <DatePicker.TableCell
                                          key={date}
                                          value={day}
                                          asChild
                                        >
                                          <chakra.td
                                            p="0"
                                            borderTopWidth="1px"
                                            borderRightWidth={
                                              dayIndex === 6 ? '0' : '1px'
                                            }
                                            borderColor="border.subtle"
                                            bg={
                                              cellState.outsideRange
                                                ? 'bg.subtle'
                                                : undefined
                                            }
                                          >
                                            {cellState.outsideRange ? (
                                              <Box
                                                minH={{ base: '14', md: '20' }}
                                                aria-hidden
                                              />
                                            ) : (
                                              <DatePicker.TableCellTrigger
                                                asChild
                                              >
                                                <Button
                                                  aria-label={dayLabel(
                                                    date,
                                                    bucket,
                                                  )}
                                                  variant="ghost"
                                                  colorPalette={
                                                    cellState.selected
                                                      ? 'blue'
                                                      : 'gray'
                                                  }
                                                  borderRadius="0"
                                                  minH={{
                                                    base: '14',
                                                    md: '20',
                                                  }}
                                                  h="auto"
                                                  w="full"
                                                  p={{ base: '1', md: '2' }}
                                                  alignItems="stretch"
                                                  justifyContent="flex-start"
                                                  flexDirection="column"
                                                  bg={
                                                    cellState.selected
                                                      ? 'blue.subtle'
                                                      : undefined
                                                  }
                                                >
                                                  <Text
                                                    alignSelf="flex-start"
                                                    textStyle="compactLabel"
                                                  >
                                                    {day.day}
                                                  </Text>
                                                  {bucket && (
                                                    <Stack
                                                      gap="0"
                                                      mt="auto"
                                                      align="start"
                                                    >
                                                      <Text fontWeight="semibold">
                                                        {bucket.totalEntries}
                                                      </Text>
                                                      <Text
                                                        display={{
                                                          base: 'none',
                                                          sm: 'block',
                                                        }}
                                                        color="fg.muted"
                                                        textStyle="compactLabel"
                                                      >
                                                        {bucket.movieWatches}M ·{' '}
                                                        {bucket.episodeWatches}E
                                                      </Text>
                                                    </Stack>
                                                  )}
                                                </Button>
                                              </DatePicker.TableCellTrigger>
                                            )}
                                          </chakra.td>
                                        </DatePicker.TableCell>
                                      );
                                    })}
                                  </chakra.tr>
                                </DatePicker.TableRow>
                              ))}
                            </chakra.tbody>
                          </DatePicker.TableBody>
                        </chakra.table>
                      </DatePicker.Table>
                    )}
                  </DatePicker.Context>
                </Box>
              </DatePicker.View>
            </Box>
          </DatePicker.Content>
        </DatePicker.Root>
      </Box>

      <Text color="fg.muted" textStyle="supporting">
        Entries without a recorded date stay in Timeline and are not placed on
        the calendar.
      </Text>

      {selectedDate && (
        <Box as="section">
          <Heading as="h2" textStyle="sectionTitle" mb="4">
            Selected day
          </Heading>
          {dayResponse && dayResponse.data.length > 0 ? (
            <DiaryTimeline
              response={dayResponse}
              isFetching={isDayFetching}
              onPageChange={onDayPageChange}
            />
          ) : (
            <Text color="fg.muted">No watches were logged for this day.</Text>
          )}
        </Box>
      )}
    </Stack>
  );
};

export default DiaryCalendar;
