import { Alert, Button, Flex, Stack } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { LuCalendarDays, LuList, LuPartyPopper } from "react-icons/lu";

import EmptyState from "@/components/info-states/empty-state";
import SimpleTabs from "@/components/simple-tabs";
import ErrorState from "@/components/info-states/error-state";
import ListSkeleton from "@/components/loading/list-skeleton";
import LoadingStatus from "@/components/loading/loading-status";
import useUpcoming, { useUpcomingWindows } from "@/features/upcoming/api/use-upcoming";
import UpcomingList from "./upcoming-list";
import UpcomingCalendar from "./upcoming-calendar";

type UpcomingView = "list" | "month";
type WindowDirection = "earlier" | "later";
type PendingLoad = { direction: WindowDirection; monthKey: string };

const pad = (value: number) => String(value).padStart(2, "0");
const utcDateOnly = (date: Date) => date.toISOString().slice(0, 10);
const dateValue = (date: string) => Date.parse(`${date}T00:00:00.000Z`);
const daysBetween = (from: string, to: string) =>
  Math.max(0, Math.round((dateValue(to) - dateValue(from)) / (24 * 60 * 60 * 1000)));
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
  const [today, setToday] = useState(() => new Date());
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
  const [emptyLoad, setEmptyLoad] = useState<PendingLoad>();
  const [scrollTargetDate, setScrollTargetDate] = useState<string>();
  const [year, setYear] = useState(today.getUTCFullYear());
  const [month, setMonth] = useState(today.getUTCMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string>();
  const previousTodayDate = useRef(todayDate);
  const activeListMonthKeys = useMemo(() => {
    if (previousTodayDate.current !== todayDate) return [todayMonthKey];

    return listMonthKeys.filter((key) => key >= minimumMonthKey && key <= maximumMonthKey);
  }, [listMonthKeys, maximumMonthKey, minimumMonthKey, todayDate, todayMonthKey]);
  const listRanges = useMemo(
    () => activeListMonthKeys.map((key) => getMonthRange(key, minimumDate, maximumDate)),
    [activeListMonthKeys, maximumDate, minimumDate],
  );
  const monthRange = useMemo(
    () => getMonthRange(`${year}-${pad(month)}`, minimumDate, maximumDate),
    [maximumDate, minimumDate, month, year],
  );
  const listUpcoming = useUpcomingWindows(listRanges, { enabled: view === "list" });
  const monthUpcoming = useUpcoming(monthRange, { enabled: view === "month" });
  const upcoming = view === "list" ? listUpcoming : monthUpcoming;
  const earliestListMonth = activeListMonthKeys[0];
  const latestListMonth = activeListMonthKeys[activeListMonthKeys.length - 1];
  const canLoadEarlier = earliestListMonth > minimumMonthKey;
  const canLoadLater = latestListMonth < maximumMonthKey;
  const earliestListRange = getMonthRange(earliestListMonth, minimumDate, maximumDate);
  const latestListRange = getMonthRange(latestListMonth, minimumDate, maximumDate);
  const earlierDaysAvailable = daysBetween(minimumDate, earliestListRange.from);
  const laterDaysAvailable = daysBetween(latestListRange.to, maximumDate);
  const hasCoverageWarning =
    (upcoming.data?.coverage.failedTitles ?? 0) > 0 || (view === "list" && listUpcoming.hasPartialCoverage);
  const coverageDescription =
    view === "list" && listRanges.length > 1
      ? "Some tracked titles could not be checked for one or more loaded months. The schedule may be incomplete."
      : `Showing dates from ${upcoming.data?.coverage.resolvedTitles ?? 0} of ${upcoming.data?.coverage.trackedTitles ?? 0} tracked titles. The schedule may be incomplete.`;

  useEffect(() => {
    const nextUtcMidnight = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1);
    const timeout = window.setTimeout(
      () => setToday(new Date()),
      Math.max(nextUtcMidnight - Date.now() + 1, 1),
    );

    return () => window.clearTimeout(timeout);
  }, [today]);

  useEffect(() => {
    if (previousTodayDate.current === todayDate) return;

    previousTodayDate.current = todayDate;
    setListMonthKeys([todayMonthKey]);
    setLoadingDirection(undefined);
    setPendingLoad(undefined);
    setEmptyLoad(undefined);
    setScrollTargetDate(undefined);
    setSelectedDate(undefined);
    setYear(today.getUTCFullYear());
    setMonth(today.getUTCMonth() + 1);
  }, [today, todayDate, todayMonthKey]);

  useEffect(() => {
    if (!listUpcoming.isFetching) setLoadingDirection(undefined);
  }, [listUpcoming.isFetching]);

  useEffect(() => {
    if (!pendingLoad) return;

    const range = getMonthRange(pendingLoad.monthKey, minimumDate, maximumDate);
    const rangeResult = listUpcoming.rangeResults.find(
      (result) => result.range.from === range.from && result.range.to === range.to,
    );

    if (!rangeResult || rangeResult.isFetching || rangeResult.isLoading) return;

    setPendingLoad(undefined);
    if (rangeResult.isError || !rangeResult.data) return;

    const loadedDates = rangeResult.data.entries
      .map((entry) => entry.date)
      .filter((date) => date >= range.from && date <= range.to)
      .sort((left, right) => left.localeCompare(right));
    const targetDate =
      pendingLoad.direction === "earlier" ? loadedDates[loadedDates.length - 1] : loadedDates[0];

    if (targetDate) {
      setScrollTargetDate(targetDate);
      setEmptyLoad(undefined);
    } else {
      setEmptyLoad(pendingLoad);
    }
  }, [listUpcoming.rangeResults, maximumDate, minimumDate, pendingLoad]);

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
      activeListMonthKeys.includes(nextMonthKey)
    ) {
      return;
    }

    setLoadingDirection(direction);
    setEmptyLoad(undefined);
    setPendingLoad({ direction, monthKey: nextMonthKey });
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
        <ListSkeleton label="Loading upcoming releases" />
      ) : upcoming.isError || !upcoming.data ? (
        <ErrorState
          title="Upcoming dates unavailable"
          description="Could not refresh the schedule for your tracked titles."
          onRetry={upcoming.refetch}
        />
      ) : (
        <Stack gap="5" aria-busy={upcoming.isFetching}>
          {upcoming.isFetching && loadingDirection === undefined && (
            <Flex justify="flex-end">
              <LoadingStatus />
            </Flex>
          )}
          {hasCoverageWarning && (
            <Alert.Root role="status" status="warning" variant="subtle">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Some tracked titles couldn’t be checked</Alert.Title>
                <Alert.Description>{coverageDescription}</Alert.Description>
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
              earlierDaysAvailable={earlierDaysAvailable}
              laterDaysAvailable={laterDaysAvailable}
              isLoading={upcoming.isFetching}
              loadingDirection={loadingDirection}
              scrollTargetDate={scrollTargetDate}
              emptyLoad={emptyLoad}
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
