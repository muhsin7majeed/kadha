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
  const monthPrefix = `${year}-${pad(month)}-`;
  const visibleDaily = daily.filter((day) => day.date.startsWith(monthPrefix));
  const totalEntries = visibleDaily.reduce(
    (total, day) => total + day.totalEntries,
    0,
  );
  const activeDays = visibleDaily.filter((day) => day.totalEntries > 0).length;
  const monthSummary =
    totalEntries === 0
      ? 'No watches logged this month'
      : `${countLabel(totalEntries, 'watch', 'watches')} across ${countLabel(activeDays, 'day')}`;

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
      <Stack width="full" maxW="6xl" mx="auto" gap="3">
        <Box
          borderWidth="1px"
          borderColor="border.subtle"
          borderRadius="2xl"
          bg="bg.panel"
          overflow="hidden"
          shadow="sm"
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
                        px={{ base: '3', sm: '5' }}
                        py={{ base: '4', sm: '5' }}
                        align="center"
                        justify="space-between"
                        gap="3"
                        bg="bg.subtle"
                        borderBottomWidth="1px"
                        borderColor="border.subtle"
                      >
                        <DatePicker.PrevTrigger asChild>
                          <Button
                            aria-label="Previous month"
                            variant="outline"
                            colorPalette="gray"
                            size="sm"
                            minW="10"
                            borderRadius="full"
                            bg="bg.panel"
                          >
                            <LuChevronLeft aria-hidden />
                          </Button>
                        </DatePicker.PrevTrigger>
                        <Stack gap="0.5" align="center" minW="0">
                          <HStack gap="1">
                            <NativeSelect.Root
                              size="sm"
                              width={{ base: '28', sm: '40' }}
                              variant="plain"
                            >
                              <NativeSelect.Field
                                aria-label="Calendar month"
                                value={month}
                                fontWeight="semibold"
                                fontSize={{ base: 'md', sm: 'lg' }}
                                textAlign="right"
                                px="2"
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
                            <Heading
                              as="h2"
                              textStyle="subsectionTitle"
                              whiteSpace="nowrap"
                            >
                              {year}
                            </Heading>
                          </HStack>
                          <Text
                            color="fg.muted"
                            textStyle="compactLabel"
                            textAlign="center"
                          >
                            {monthSummary}
                          </Text>
                        </Stack>
                        <DatePicker.NextTrigger asChild>
                          <Button
                            aria-label="Next month"
                            variant="outline"
                            colorPalette="gray"
                            size="sm"
                            minW="10"
                            borderRadius="full"
                            bg="bg.panel"
                          >
                            <LuChevronRight aria-hidden />
                          </Button>
                        </DatePicker.NextTrigger>
                      </Flex>
                    </DatePicker.ViewControl>

                    <DatePicker.Context>
                      {(api) => (
                        <Box
                          px={{ base: '1', sm: '3' }}
                          pb={{ base: '1', sm: '3' }}
                        >
                          <DatePicker.Table asChild>
                            <chakra.table
                              width="full"
                              tableLayout="fixed"
                              borderCollapse="separate"
                              borderSpacing={{ base: '1px', sm: '4px' }}
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
                                            py={{ base: '2', sm: '3' }}
                                            textAlign="center"
                                            color="fg.muted"
                                            textStyle="compactLabel"
                                            fontWeight="medium"
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
                                    <DatePicker.TableRow
                                      key={weekIndex}
                                      asChild
                                    >
                                      <chakra.tr>
                                        {week.map((day) => {
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
                                              <chakra.td p="0">
                                                {cellState.outsideRange ? (
                                                  <Box
                                                    minH={{
                                                      base: '12',
                                                      sm: '16',
                                                    }}
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
                                                      colorPalette="gray"
                                                      borderRadius="lg"
                                                      borderWidth={
                                                        cellState.selected
                                                          ? '2px'
                                                          : '1px'
                                                      }
                                                      borderColor={
                                                        cellState.selected
                                                          ? 'brand.solid'
                                                          : bucket
                                                            ? 'brand.muted'
                                                            : 'transparent'
                                                      }
                                                      minH={{
                                                        base: '12',
                                                        sm: '16',
                                                      }}
                                                      h="auto"
                                                      w="full"
                                                      p={{
                                                        base: '1.5',
                                                        sm: '2',
                                                      }}
                                                      alignItems="stretch"
                                                      justifyContent="flex-start"
                                                      flexDirection="column"
                                                      color={
                                                        cellState.selected
                                                          ? 'brand.fg'
                                                          : 'fg'
                                                      }
                                                      bg={
                                                        cellState.selected
                                                          ? 'brand.subtle'
                                                          : bucket
                                                            ? 'bg.subtle'
                                                            : 'transparent'
                                                      }
                                                      transitionProperty="colors"
                                                      transitionDuration="fast"
                                                      _hover={{
                                                        bg: bucket
                                                          ? 'brand.subtle'
                                                          : 'bg.subtle',
                                                        borderColor: bucket
                                                          ? 'brand.solid'
                                                          : 'border',
                                                      }}
                                                      _focusVisible={{
                                                        outline: '2px solid',
                                                        outlineColor:
                                                          'brand.focusRing',
                                                        outlineOffset: '2px',
                                                        zIndex: '1',
                                                      }}
                                                    >
                                                      <HStack
                                                        justify="space-between"
                                                        align="start"
                                                      >
                                                        <Text
                                                          textStyle="compactLabel"
                                                          fontWeight={
                                                            cellState.today
                                                              ? 'bold'
                                                              : 'medium'
                                                          }
                                                          textDecoration={
                                                            cellState.today
                                                              ? 'underline'
                                                              : undefined
                                                          }
                                                          textUnderlineOffset="4px"
                                                        >
                                                          {day.day}
                                                        </Text>
                                                        {cellState.today && (
                                                          <Text
                                                            display={{
                                                              base: 'none',
                                                              md: 'block',
                                                            }}
                                                            color="brand.fg"
                                                            textStyle="compactLabel"
                                                            fontWeight="semibold"
                                                          >
                                                            Today
                                                          </Text>
                                                        )}
                                                      </HStack>
                                                      {bucket && (
                                                        <Stack
                                                          gap="1"
                                                          mt="auto"
                                                          align="start"
                                                          minW="0"
                                                        >
                                                          <Text
                                                            display={{
                                                              base: 'block',
                                                              sm: 'none',
                                                            }}
                                                            fontWeight="semibold"
                                                            textStyle="compactLabel"
                                                          >
                                                            {
                                                              bucket.totalEntries
                                                            }
                                                          </Text>
                                                          <HStack
                                                            display={{
                                                              base: 'none',
                                                              sm: 'flex',
                                                            }}
                                                            gap="1"
                                                            flexWrap="wrap"
                                                          >
                                                            {bucket.movieWatches >
                                                              0 && (
                                                              <Text
                                                                px="1.5"
                                                                py="0.5"
                                                                borderRadius="full"
                                                                bg="brand.subtle"
                                                                color="brand.fg"
                                                                textStyle="compactLabel"
                                                                whiteSpace="nowrap"
                                                              >
                                                                {countLabel(
                                                                  bucket.movieWatches,
                                                                  'movie',
                                                                )}
                                                              </Text>
                                                            )}
                                                            {bucket.episodeWatches >
                                                              0 && (
                                                              <Text
                                                                px="1.5"
                                                                py="0.5"
                                                                borderRadius="full"
                                                                bg="brand.subtle"
                                                                color="brand.fg"
                                                                textStyle="compactLabel"
                                                                whiteSpace="nowrap"
                                                              >
                                                                {countLabel(
                                                                  bucket.episodeWatches,
                                                                  'episode',
                                                                )}
                                                              </Text>
                                                            )}
                                                          </HStack>
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
                        </Box>
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
      </Stack>

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
