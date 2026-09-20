import { Alert, Box, Stack, Tabs } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { LuCalendarDays, LuList, LuPartyPopper } from 'react-icons/lu';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import CommonSpinner from '@/components/spinners/common-spinner';
import useUpcoming from '@/features/upcoming/api/use-upcoming';
import UpcomingAgenda from './upcoming-agenda';
import UpcomingCalendar from './upcoming-calendar';

type UpcomingView = 'agenda' | 'month';

const pad = (value: number) => String(value).padStart(2, '0');
const localDateOnly = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
const monthEnd = (year: number, month: number) => localDateOnly(new Date(year, month, 0));

const UpcomingPageContent = () => {
  const [today] = useState(() => new Date());
  const todayDate = localDateOnly(today);
  const currentMonthKey = todayDate.slice(0, 7);
  const [view, setView] = useState<UpcomingView>('agenda');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string>();
  const range = useMemo(() => {
    if (view === 'agenda') {
      return { from: todayDate, to: localDateOnly(addDays(today, 91)) };
    }

    const monthStart = `${year}-${pad(month)}-01`;
    return {
      from: monthStart < todayDate ? todayDate : monthStart,
      to: monthEnd(year, month),
    };
  }, [month, today, todayDate, view, year]);
  const upcoming = useUpcoming(range);

  const changePeriod = (nextYear: number, nextMonth: number) => {
    const nextMonthKey = `${nextYear}-${pad(nextMonth)}`;
    if (nextMonthKey < currentMonthKey) return;

    setYear(nextYear);
    setMonth(nextMonth);
    setSelectedDate(undefined);
  };

  return (
    <Tabs.Root
      value={view}
      onValueChange={(details) => {
        setView(details.value as UpcomingView);
        setSelectedDate(undefined);
      }}
      variant="line"
    >
      <Box overflowX="auto" mb="5">
        <Tabs.List minW="fit-content">
          <Tabs.Trigger value="agenda" textStyle="compactLabel">
            <LuList aria-hidden /> Agenda
          </Tabs.Trigger>
          <Tabs.Trigger value="month" textStyle="compactLabel">
            <LuCalendarDays aria-hidden /> Month
          </Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
      </Box>

      {upcoming.isLoading ? (
        <CommonSpinner />
      ) : upcoming.isError || !upcoming.data ? (
        <ErrorState
          title="Upcoming dates unavailable"
          description="Could not refresh the schedule for your tracked titles."
          onRetry={upcoming.refetch}
        />
      ) : upcoming.data.entries.length === 0 && view === 'agenda' ? (
        <EmptyState
          title="Nothing scheduled"
          description="No tracked episodes or watchlist movie releases have dates in this period."
          icon={<LuPartyPopper />}
        />
      ) : (
        <Stack gap="5" aria-busy={upcoming.isFetching}>
          {upcoming.data.coverage.failedTitles > 0 && (
            <Alert.Root role="status" status="warning" variant="subtle">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Some upcoming dates could not be refreshed</Alert.Title>
                <Alert.Description>
                  Showing dates from {upcoming.data.coverage.resolvedTitles} of{' '}
                  {upcoming.data.coverage.trackedTitles} tracked titles.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {view === 'agenda' ? (
            <UpcomingAgenda entries={upcoming.data.entries} />
          ) : (
            <UpcomingCalendar
              entries={upcoming.data.entries}
              minimumDate={todayDate}
              month={month}
              onPeriodChange={changePeriod}
              onSelectDate={setSelectedDate}
              selectedDate={selectedDate}
              year={year}
            />
          )}
        </Stack>
      )}
    </Tabs.Root>
  );
};

export default UpcomingPageContent;
