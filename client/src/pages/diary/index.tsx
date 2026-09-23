import { Box, Card, SimpleGrid, Stack, Tabs, Text } from "@chakra-ui/react";
import { useState } from "react";
import {
  LuBookOpen,
  LuCalendarDays,
  LuChartNoAxesColumnIncreasing,
  LuList,
} from "react-icons/lu";

import EmptyState from "@/components/info-states/empty-state";
import SimpleTabs from "@/components/simple-tabs";
import ErrorState from "@/components/info-states/error-state";
import PageHeader from "@/components/page-header";
import CommonSpinner from "@/components/spinners/common-spinner";
import useDiary from "@/features/user-media/api/use-diary";
import useDiaryInsights from "@/features/user-media/api/use-diary-insights";
import DiaryCalendar from "@/features/user-media/components/diary-calendar";
import DiaryFilters, {
  DiaryMediaType,
} from "@/features/user-media/components/diary-filters";
import DiaryHeatmap from "@/features/user-media/components/diary-heatmap";
import DiarySummary from "@/features/user-media/components/diary-summary";
import DiaryTimeline from "@/features/user-media/components/diary-timeline";
import DiaryTrends from "@/features/user-media/components/diary-trends";

export type DiaryTab = "timeline" | "calendar" | "insights";

const Diary = () => {
  const [tab, setTab] = useState<DiaryTab>("timeline");
  const [page, setPage] = useState(1);
  const [mediaType, setMediaType] = useState<DiaryMediaType>("all");
  const [year, setYear] = useState<number>();
  const today = new Date();
  const [month, setMonth] = useState<number>();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string>();
  const [dayPage, setDayPage] = useState(1);
  const diary = useDiary({
    page,
    mediaType,
    year,
    month: tab === "timeline" ? month : undefined,
  });
  const calendarYear =
    year ?? diary.data?.availableYears[0] ?? today.getFullYear();
  const insights = useDiaryInsights(
    calendarYear,
    mediaType,
    tab === "calendar" || tab === "insights",
  );
  const dayDiary = useDiary(
    { page: dayPage, mediaType, date: selectedDate },
    tab === "calendar" && selectedDate !== undefined,
  );

  const resetPage = () => setPage(1);
  const changeTab = (value: DiaryTab) => {
    setTab(value);
    if (value !== "timeline" && year === undefined) setYear(calendarYear);
  };

  return (
    <Box>
      <PageHeader
        isFetching={diary.isFetching}
        subHeader="A private record of each movie watch, rewatch, and TV episode you log."
      >
        Diary
      </PageHeader>

      <SimpleTabs
        tabs={[
          {
            value: "timeline",
            label: "Timeline",
            icon: <LuList aria-hidden />,
          },
          {
            value: "calendar",
            label: "Calendar",
            icon: <LuCalendarDays aria-hidden />,
          },
          {
            value: "insights",
            label: "Insights",
            icon: <LuChartNoAxesColumnIncreasing aria-hidden />,
          },
        ]}
        value={tab}
        listProps={{ mb: "5" }}
        variant="line"
        onValueChange={(value) => changeTab(value as DiaryTab)}
      >
        <>
          <DiaryFilters
            availableYears={diary.data?.availableYears ?? []}
            disabled={diary.isFetching}
            mediaType={mediaType}
            month={month}
            year={year}
            showMonth={tab === "timeline"}
            onMediaTypeChange={(value) => {
              setMediaType(value);
              setDayPage(1);
              resetPage();
            }}
            onYearChange={(value) => {
              setYear(value);
              if (value === undefined) setMonth(undefined);
              setSelectedDate(undefined);
              resetPage();
            }}
            onMonthChange={(value) => {
              setMonth(value);
              resetPage();
            }}
          />

          {diary.isLoading ? (
            <CommonSpinner />
          ) : diary.isError || !diary.data ? (
            <ErrorState
              title="Diary unavailable"
              description="Could not load your viewing diary."
              onRetry={diary.refetch}
            />
          ) : (
            <Box mt="5">
              <DiarySummary summary={diary.data.summary} />

              <Tabs.Content value="timeline" mt="6">
                {diary.data.data.length === 0 ? (
                  <EmptyState
                    title={
                      year || mediaType !== "all"
                        ? "No watches match these filters"
                        : "Your diary is ready for its first entry"
                    }
                    description={
                      year || mediaType !== "all"
                        ? "Try another year or media type."
                        : "Log a movie or mark a TV episode watched and it will appear here."
                    }
                    icon={<LuBookOpen />}
                  />
                ) : (
                  <DiaryTimeline
                    response={diary.data}
                    isFetching={diary.isFetching}
                    onPageChange={setPage}
                  />
                )}
              </Tabs.Content>

              <Tabs.Content value="calendar" mt="6">
                {insights.isLoading ? (
                  <CommonSpinner />
                ) : insights.isError || !insights.data ? (
                  <ErrorState
                    title="Calendar unavailable"
                    description="Could not load your dated diary entries."
                    onRetry={insights.refetch}
                  />
                ) : (
                  <DiaryCalendar
                    year={calendarYear}
                    month={calendarMonth}
                    daily={insights.data.daily}
                    selectedDate={selectedDate}
                    dayResponse={dayDiary.data}
                    isDayError={dayDiary.isError}
                    isDayFetching={dayDiary.isFetching}
                    isDayLoading={dayDiary.isLoading}
                    onDayPageChange={setDayPage}
                    onDayRetry={() => void dayDiary.refetch()}
                    onSelectDate={(date) => {
                      setSelectedDate(date);
                      setDayPage(1);
                    }}
                    onPeriodChange={(nextYear, nextMonth) => {
                      setYear(nextYear);
                      setCalendarMonth(nextMonth);
                      setSelectedDate(undefined);
                      setDayPage(1);
                    }}
                  />
                )}
              </Tabs.Content>

              <Tabs.Content value="insights" mt="6">
                {insights.isLoading ? (
                  <CommonSpinner />
                ) : insights.isError || !insights.data ? (
                  <ErrorState
                    title="Diary insights unavailable"
                    description="Could not load your viewing patterns."
                    onRetry={insights.refetch}
                  />
                ) : (
                  <Stack gap="5">
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap="3">
                      <Card.Root variant="outline">
                        <Card.Body gap="1">
                          <Text color="fg.muted" textStyle="compactLabel">
                            Active viewing days
                          </Text>
                          <Text textStyle="subsectionTitle">
                            {insights.data.activeDays}
                          </Text>
                          <Text color="fg.muted" textStyle="supporting">
                            Days with a recorded watch date
                          </Text>
                        </Card.Body>
                      </Card.Root>
                      <Card.Root variant="outline">
                        <Card.Body gap="1">
                          <Text color="fg.muted" textStyle="compactLabel">
                            Busiest recorded day
                          </Text>
                          <Text textStyle="subsectionTitle">
                            {insights.data.busiestDay?.totalEntries ?? "—"}
                          </Text>
                          <Text color="fg.muted" textStyle="supporting">
                            {insights.data.busiestDay
                              ? `${insights.data.busiestDay.date} · ${insights.data.busiestDay.totalEntries === 1 ? "entry" : "entries"}`
                              : "No dated entries this year"}
                          </Text>
                        </Card.Body>
                      </Card.Root>
                    </SimpleGrid>

                    <DiaryHeatmap
                      year={calendarYear}
                      daily={insights.data.daily}
                      onSelectDate={(date) => {
                        const [, selectedMonth] = date.split("-").map(Number);
                        setCalendarMonth(selectedMonth);
                        setSelectedDate(date);
                        setDayPage(1);
                        setTab("calendar");
                      }}
                    />
                    <DiaryTrends monthly={insights.data.monthly} />
                    <Text color="fg.muted" textStyle="supporting">
                      {Math.round(insights.data.dateCoverage.ratio * 100)}% of
                      eligible diary entries have a recorded date.{" "}
                      {Math.round(
                        insights.data.summary.runtimeCoverage.ratio * 100,
                      )}
                      % of this year’s entries include runtime data.
                    </Text>
                  </Stack>
                )}
              </Tabs.Content>
            </Box>
          )}
        </>
      </SimpleTabs>

      <Text color="fg.muted" textStyle="supporting" mt="6">
        Your diary is private and visible only to you.
      </Text>
    </Box>
  );
};

export default Diary;
