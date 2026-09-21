import { Alert, Button, Stack } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { LuCalendarDays, LuList, LuPartyPopper } from "react-icons/lu";

import EmptyState from "@/components/info-states/empty-state";
import SimpleTabs from "@/components/simple-tabs";
import ErrorState from "@/components/info-states/error-state";
import CommonSpinner from "@/components/spinners/common-spinner";
import useUpcoming, { useUpcomingWindows } from "@/features/upcoming/api/use-upcoming";
import UpcomingList from "./upcoming-list";
import UpcomingCalendar from "./upcoming-calendar";

type UpcomingView = "list" | "month";
type WindowDirection = "earlier" | "later";
type PendingLoad = { monthKey: string };

const pad = (value: number) => String(value).padStart(2, "0");
const utcDateOnly = (date: Date) => date.toISOString().slice(0, 10);
const addUtcDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};
const monthEnd = (year: number, month: number) =>
  utcDateOnly(new Date(Date.UTC(year, month, 0)));
const monthKey = (date: Date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
const shiftMonthKey = (value: string, offset: number) => {
  const [year, month] = value.split("-").map(Number);
  return monthKey(new Date(Date.UTC(year, month - 1 + offset, 1)));
};

const getMonthRange = (key: string, minimumDate: string, maximumDate: string) => {
  const [year, month] = key.split("-").map(Number);
  const start = `${key}-01`;
  const end = monthEnd(year, month);

  return {
    from: start < minimumDate ? minimumDate : start,
    to: end > maximumDate ? maximumDate : end,
  };
};

const UpcomingPageContent = () => {
  const [today] = useState(() => new Date());
  const todayDate = utcDateOnly(today);
  const minimumDate = utcDateOnly(addUtcDays(today, -90));
  const maximumDate = utcDateOnly(addUtcDays(today, 90));
  const minimumMonthKey = minimumDate.slice(0, 7);
  const maximumMonthKey = maximumDate.slice(0, 7);
  const todayMonthKey = monthKey(today);
  const [view, setView] = useState<UpcomingView>("list");
  const [listMonthKeys, setListMonthKeys] = useState([todayMonthKey]);
  const [loadingDirection, setLoadingDirection] = useState<WindowDirection>();
  const [pendingLoad, setPendingLoad] = useState<PendingLoad>();
  const [scrollTargetDate, setScrollTargetDate] = useState<string>();
  const [year, setYear] = useState(today.getUTCFullYear());
  const [month, setMonth] = useState(today.getUTCMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string>();
  const listRanges = useMemo(
    () => listMonthKeys.map((key) => getMonthRange(key, minimumDate, maximumDate)),
    [listMonthKeys, maximumDate, minimumDate],
  );
  const monthRange = useMemo(
    () => getMonthRange(`${year}-${pad(month)}`, minimumDate, maximumDate),
    [maximumDate, minimumDate, month, year],
  );
  const listUpcoming = useUpcomingWindows(listRanges, { enabled: view === "list" });
  const monthUpcoming = useUpcoming(monthRange, { enabled: view === "month" });
  const upcoming = view === "list" ? listUpcoming : monthUpcoming;
  const earliestListMonth = listMonthKeys[0];
  const latestListMonth = listMonthKeys[listMonthKeys.length - 1];
  const canLoadEarlier = earliestListMonth > minimumMonthKey;
  const canLoadLater = latestListMonth < maximumMonthKey;

  useEffect(() => {
    if (!pendingLoad || listUpcoming.isFetching || !listUpcoming.data) return;

    const range = getMonthRange(pendingLoad.monthKey, minimumDate, maximumDate);
    const firstLoadedDate = listUpcoming.data.entries
      .map((entry) => entry.date)
      .filter((date) => date >= range.from && date <= range.to)
      .sort((left, right) => left.localeCompare(right))[0];

    if (firstLoadedDate) setScrollTargetDate(firstLoadedDate);
    setPendingLoad(undefined);
  }, [listUpcoming.data, listUpcoming.isFetching, maximumDate, minimumDate, pendingLoad]);

  const changePeriod = (nextYear: number, nextMonth: number) => {
    const nextMonthKey = `${nextYear}-${pad(nextMonth)}`;
    if (nextMonthKey < minimumMonthKey || nextMonthKey > maximumMonthKey) return;

    setYear(nextYear);
    setMonth(nextMonth);
    setSelectedDate(undefined);
  };

  const loadAdjacentMonth = (direction: WindowDirection) => {
    const boundary = direction === "earlier" ? earliestListMonth : latestListMonth;
    const nextMonthKey = shiftMonthKey(boundary, direction === "earlier" ? -1 : 1);

    if (
      nextMonthKey < minimumMonthKey ||
      nextMonthKey > maximumMonthKey ||
      listMonthKeys.includes(nextMonthKey)
    ) {
      return;
    }

    setLoadingDirection(direction);
    setPendingLoad({ monthKey: nextMonthKey });
    setListMonthKeys((current) =>
      [...current, nextMonthKey].sort((left, right) => left.localeCompare(right)),
    );
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
          {view === "list" && listUpcoming.hasRangeError && (
            <Alert.Root role="status" status="warning" variant="subtle">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Some schedule dates could not be loaded</Alert.Title>
                <Alert.Description>
                  Try again to refresh the missing date range.
                </Alert.Description>
                <Button
                  alignSelf="flex-start"
                  size="sm"
                  variant="outline"
                  colorPalette="gray"
                  onClick={() => void listUpcoming.refetch()}
                >
                  Try again
                </Button>
              </Alert.Content>
            </Alert.Root>
          )}
          {view === "list" && (
            <UpcomingList
              entries={upcoming.data.entries}
              todayDate={todayDate}
              canLoadEarlier={canLoadEarlier}
              canLoadLater={canLoadLater}
              isLoading={upcoming.isFetching}
              loadingDirection={loadingDirection}
              scrollTargetDate={scrollTargetDate}
              onLoadEarlier={() => loadAdjacentMonth("earlier")}
              onLoadLater={() => loadAdjacentMonth("later")}
            />
          )}
          {view === "month" && upcoming.data.entries.length === 0 && (
            <EmptyState
              title="Nothing scheduled"
              description="No tracked episodes or watchlist movie releases have dates in this period."
              icon={<LuPartyPopper />}
            />
          )}
          {view === "month" && (
            <UpcomingCalendar
              entries={upcoming.data.entries}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              todayDate={todayDate}
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
