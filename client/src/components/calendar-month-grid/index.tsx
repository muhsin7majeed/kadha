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
import { type ReactNode, useEffect, useState } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const locale = typeof navigator === 'undefined' ? 'en-US' : navigator.language;
const monthNames = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, index, 1))),
);
const pad = (value: number) => String(value).padStart(2, '0');
const dateKey = (year: number, month: number, day: number) => `${year}-${pad(month)}-${pad(day)}`;

interface CalendarMonthGridProps {
  getDayLabel: (date: string) => string;
  hasContent?: (date: string) => boolean;
  minimumDate?: string;
  maximumDate?: string;
  month: number;
  onPeriodChange: (year: number, month: number) => void;
  onSelectDate: (date: string) => void;
  renderDayContent?: (date: string) => ReactNode;
  selectedDate?: string;
  summary: ReactNode;
  year: number;
}

const CalendarMonthGrid = ({
  getDayLabel,
  hasContent = () => false,
  minimumDate,
  maximumDate,
  month,
  onPeriodChange,
  onSelectDate,
  renderDayContent,
  selectedDate,
  summary,
  year,
}: CalendarMonthGridProps) => {
  const periodStart = dateKey(year, month, 1);
  const periodKey = `${year}-${pad(month)}`;
  const minimumMonthKey = minimumDate?.slice(0, 7);
  const maximumMonthKey = maximumDate?.slice(0, 7);
  const previousMonthDisabled = Boolean(minimumMonthKey && periodKey <= minimumMonthKey);
  const nextMonthDisabled = Boolean(maximumMonthKey && periodKey >= maximumMonthKey);
  const defaultFocusDate =
    minimumDate?.startsWith(`${year}-${pad(month)}-`) && minimumDate > periodStart ? minimumDate : periodStart;
  const focusedDate = selectedDate?.startsWith(`${year}-${pad(month)}-`) ? selectedDate : defaultFocusDate;
  const [focusedValue, setFocusedValue] = useState<DateValue>(() => parseDate(focusedDate));

  useEffect(() => {
    setFocusedValue(parseDate(focusedDate));
  }, [focusedDate]);

  const handleFocusChange = (nextFocusedValue: DateValue) => {
    setFocusedValue(nextFocusedValue);
    if (nextFocusedValue.year !== year || nextFocusedValue.month !== month) {
      onPeriodChange(nextFocusedValue.year, nextFocusedValue.month);
    }
  };

  return (
    <Box borderWidth="1px" borderColor="border.subtle" borderRadius="2xl" bg="bg.panel" overflow="hidden" shadow="sm">
      <DatePicker.Root
        open
        closeOnSelect={false}
        locale={locale}
        timeZone="UTC"
        focusedValue={focusedValue}
        min={minimumDate ? parseDate(minimumDate) : undefined}
        max={maximumDate ? parseDate(maximumDate) : undefined}
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
                        disabled={previousMonthDisabled}
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
                        <NativeSelect.Root size="sm" width={{ base: '28', sm: '40' }} variant="plain">
                          <NativeSelect.Field
                            aria-label="Calendar month"
                            value={month}
                            fontWeight="semibold"
                            fontSize={{ base: 'md', sm: 'lg' }}
                            textAlign="right"
                            px="2"
                            onChange={(event) => onPeriodChange(year, Number(event.currentTarget.value))}
                          >
                            {monthNames.map((name, index) => {
                              const monthKey = `${year}-${pad(index + 1)}`;

                              return (
                                <option
                                  key={name}
                                  value={index + 1}
                                  disabled={
                                    (minimumMonthKey !== undefined && monthKey < minimumMonthKey) ||
                                    (maximumMonthKey !== undefined && monthKey > maximumMonthKey)
                                  }
                                >
                                  {name}
                                </option>
                              );
                            })}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                        <Heading as="h2" textStyle="subsectionTitle" whiteSpace="nowrap">
                          {year}
                        </Heading>
                      </HStack>
                      <Text color="fg.muted" textStyle="compactLabel" textAlign="center">
                        {summary}
                      </Text>
                    </Stack>
                    <DatePicker.NextTrigger asChild>
                      <Button
                        aria-label="Next month"
                        disabled={nextMonthDisabled}
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
                    <Box px={{ base: '1', sm: '3' }} pb={{ base: '1', sm: '3' }}>
                      <DatePicker.Table asChild>
                        <chakra.table width="full" tableLayout="fixed" borderCollapse="separate" borderSpacing={{ base: '1px', sm: '4px' }}>
                          <DatePicker.TableHead asChild>
                            <chakra.thead>
                              <DatePicker.TableRow asChild>
                                <chakra.tr>
                                  {api.weekDays.map((weekDay) => (
                                    <DatePicker.TableHeader key={weekDay.value.toString()} asChild>
                                      <chakra.th
                                        py={{ base: '2', sm: '3' }}
                                        textAlign="center"
                                        color="fg.muted"
                                        textStyle="compactLabel"
                                        fontWeight="medium"
                                      >
                                        <chakra.span aria-hidden>{weekDay.short}</chakra.span>
                                        <chakra.span srOnly>{weekDay.long}</chakra.span>
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
                                    {week.map((day) => {
                                      const cellState = api.getDayTableCellState({
                                        value: day,
                                        visibleRange: api.visibleRange,
                                      });
                                      const date = day.toString();
                                      const highlighted = hasContent(date);

                                      return (
                                        <DatePicker.TableCell key={date} value={day} asChild>
                                          <chakra.td p="0">
                                            {cellState.outsideRange ? (
                                              <Box minH={{ base: '12', sm: '16' }} aria-hidden />
                                            ) : (
                                              <DatePicker.TableCellTrigger asChild>
                                                <Button
                                                  aria-label={getDayLabel(date)}
                                                  variant="ghost"
                                                  colorPalette="gray"
                                                  borderRadius="lg"
                                                  borderWidth={cellState.selected ? '2px' : '1px'}
                                                  borderColor={
                                                    cellState.selected
                                                      ? 'brand.solid'
                                                      : highlighted
                                                        ? 'brand.muted'
                                                        : 'transparent'
                                                  }
                                                  minH={{ base: '12', sm: '16' }}
                                                  h="auto"
                                                  w="full"
                                                  p={{ base: '1.5', sm: '2' }}
                                                  alignItems="stretch"
                                                  justifyContent="flex-start"
                                                  flexDirection="column"
                                                  color={cellState.selected ? 'brand.fg' : 'fg'}
                                                  bg={
                                                    cellState.selected
                                                      ? 'brand.subtle'
                                                      : highlighted
                                                        ? 'bg.subtle'
                                                        : 'transparent'
                                                  }
                                                  transitionProperty="colors"
                                                  transitionDuration="fast"
                                                  _hover={{
                                                    bg: highlighted ? 'brand.subtle' : 'bg.subtle',
                                                    borderColor: highlighted ? 'brand.solid' : 'border',
                                                  }}
                                                  _focusVisible={{
                                                    outline: '2px solid',
                                                    outlineColor: 'brand.focusRing',
                                                    outlineOffset: '2px',
                                                    zIndex: '1',
                                                  }}
                                                >
                                                  <HStack justify="space-between" align="start">
                                                    <Text
                                                      textStyle="compactLabel"
                                                      fontWeight={cellState.today ? 'bold' : 'medium'}
                                                      textDecoration={cellState.today ? 'underline' : undefined}
                                                      textUnderlineOffset="4px"
                                                    >
                                                      {day.day}
                                                    </Text>
                                                    {cellState.today && (
                                                      <Text
                                                        display={{ base: 'none', md: 'block' }}
                                                        color="brand.fg"
                                                        textStyle="compactLabel"
                                                        fontWeight="semibold"
                                                      >
                                                        Today
                                                      </Text>
                                                    )}
                                                  </HStack>
                                                  {renderDayContent?.(date)}
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
  );
};

export default CalendarMonthGrid;
