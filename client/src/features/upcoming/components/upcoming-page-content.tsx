import { Alert, Stack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { LuCalendarDays, LuList, LuPartyPopper } from "react-icons/lu";

import EmptyState from "@/components/info-states/empty-state";
import SimpleTabs from "@/components/simple-tabs";
import ErrorState from "@/components/info-states/error-state";
import CommonSpinner from "@/components/spinners/common-spinner";
import useUpcoming from "@/features/upcoming/api/use-upcoming";
import UpcomingList from "./upcoming-list";
import UpcomingCalendar from "./upcoming-calendar";

type UpcomingView = "list" | "month";

const pad = (value: number) => String(value).padStart(2, "0");
const utcDateOnly = (date: Date) => date.toISOString().slice(0, 10);
const addUtcDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};
const monthEnd = (year: number, month: number) =>
  utcDateOnly(new Date(Date.UTC(year, month, 0)));

const UpcomingPageContent = () => {
  const [today] = useState(() => new Date());
  const todayDate = utcDateOnly(today);
  const currentMonthKey = todayDate.slice(0, 7);
  const [view, setView] = useState<UpcomingView>("list");
  const [year, setYear] = useState(today.getUTCFullYear());
  const [month, setMonth] = useState(today.getUTCMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string>();
  const range = useMemo(() => {
    if (view === "list") {
      return { from: todayDate, to: utcDateOnly(addUtcDays(today, 91)) };
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
    <SimpleTabs
      tabs={[
        { value: "list", label: "List", icon: <LuList aria-hidden /> },
        {
          value: "month",
          label: "Month",
          icon: <LuCalendarDays aria-hidden />,
        },
      ]}
      value={view}
      listProps={{ mb: "5" }}
      variant="line"
      onValueChange={(value) => {
        setView(value as UpcomingView);
        setSelectedDate(undefined);
      }}
    >
      {upcoming.isLoading ? (
        <CommonSpinner />
      ) : upcoming.isError || !upcoming.data ? (
        <ErrorState
          title="Upcoming dates unavailable"
          description="Could not refresh the schedule for your tracked titles."
          onRetry={upcoming.refetch}
        />
      ) : (
        <Stack gap="5" aria-busy={upcoming.isFetching}>
          {upcoming.data.coverage.failedTitles > 0 && (
            <Alert.Root role="status" status="warning" variant="subtle">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>
                  Some upcoming dates could not be refreshed
                </Alert.Title>
                <Alert.Description>
                  Showing dates from {upcoming.data.coverage.resolvedTitles} of{" "}
                  {upcoming.data.coverage.trackedTitles} tracked titles.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {view === "list" && upcoming.data.entries.length === 0 && (
            <EmptyState
              title="Nothing scheduled"
              description="No tracked episodes or watchlist movie releases have dates in this period."
              icon={<LuPartyPopper />}
            />
          )}
          {view === "list" && upcoming.data.entries.length > 0 && (
            <UpcomingList
              entries={upcoming.data.entries}
              todayDate={todayDate}
            />
          )}
          {view === "month" && (
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
    </SimpleTabs>
  );
};

export default UpcomingPageContent;
