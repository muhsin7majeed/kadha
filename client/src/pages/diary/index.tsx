import { Alert, Box, Tabs, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { LuBookOpen, LuCalendarDays, LuChartNoAxesColumnIncreasing, LuList } from 'react-icons/lu';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';
import CommonSpinner from '@/components/spinners/common-spinner';
import useDiary from '@/features/user-media/api/use-diary';
import useDiaryInsights from '@/features/user-media/api/use-diary-insights';
import DiaryCalendar from '@/features/user-media/components/diary-calendar';
import DiaryFilters, { DiaryMediaType } from '@/features/user-media/components/diary-filters';
import DiarySummary from '@/features/user-media/components/diary-summary';
import DiaryTimeline from '@/features/user-media/components/diary-timeline';

export type DiaryTab = 'timeline' | 'calendar' | 'insights';

const Diary = () => {
  const [tab, setTab] = useState<DiaryTab>('timeline');
  const [page, setPage] = useState(1);
  const [mediaType, setMediaType] = useState<DiaryMediaType>('all');
  const [year, setYear] = useState<number>();
  const today = new Date();
  const [month, setMonth] = useState<number>();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string>();
  const [dayPage, setDayPage] = useState(1);
  const diary = useDiary({ page, mediaType, year, month: tab === 'timeline' ? month : undefined });
  const calendarYear = year ?? diary.data?.availableYears[0] ?? today.getFullYear();
  const insights = useDiaryInsights(calendarYear, mediaType, tab === 'calendar' || tab === 'insights');
  const dayDiary = useDiary(
    { page: dayPage, mediaType, date: selectedDate },
    tab === 'calendar' && selectedDate !== undefined,
  );

  const resetPage = () => setPage(1);
  const changeTab = (value: DiaryTab) => {
    setTab(value);
    if (value !== 'timeline' && year === undefined) setYear(calendarYear);
  };

  return (
    <Box>
      <PageHeader
        isFetching={diary.isFetching}
        subHeader="A private record of each movie watch, rewatch, and TV episode you log."
      >
        Diary
      </PageHeader>

      <Tabs.Root value={tab} onValueChange={(details) => changeTab(details.value as DiaryTab)} variant="line">
        <Box overflowX="auto" mb="5">
          <Tabs.List minW="fit-content">
            <Tabs.Trigger value="timeline" textStyle="compactLabel">
              <LuList aria-hidden /> Timeline
            </Tabs.Trigger>
            <Tabs.Trigger value="calendar" textStyle="compactLabel">
              <LuCalendarDays aria-hidden /> Calendar
            </Tabs.Trigger>
            <Tabs.Trigger value="insights" textStyle="compactLabel">
              <LuChartNoAxesColumnIncreasing aria-hidden /> Insights
            </Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
        </Box>

        <DiaryFilters
          availableYears={diary.data?.availableYears ?? []}
          disabled={diary.isFetching}
          mediaType={mediaType}
          month={month}
          year={year}
          showMonth={tab === 'timeline'}
          onMediaTypeChange={(value) => {
            setMediaType(value);
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
          <ErrorState title="Diary unavailable" description="Could not load your viewing diary." onRetry={diary.refetch} />
        ) : (
          <Box mt="5">
            <DiarySummary summary={diary.data.summary} />

            <Tabs.Content value="timeline" mt="6">
              {diary.data.data.length === 0 ? (
                <EmptyState
                  title={year || mediaType !== 'all' ? 'No watches match these filters' : 'Your diary is ready for its first entry'}
                  description={
                    year || mediaType !== 'all'
                      ? 'Try another year or media type.'
                      : 'Log a movie or mark a TV episode watched and it will appear here.'
                  }
                  icon={<LuBookOpen />}
                />
              ) : (
                <DiaryTimeline response={diary.data} isFetching={diary.isFetching} onPageChange={setPage} />
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
                  isDayFetching={dayDiary.isFetching}
                  onDayPageChange={setDayPage}
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
              <Alert.Root status="info">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Insights are being prepared</Alert.Title>
                  <Alert.Description>Yearly activity and estimated-time patterns will appear here.</Alert.Description>
                </Alert.Content>
              </Alert.Root>
            </Tabs.Content>
          </Box>
        )}
      </Tabs.Root>

      <Text color="fg.muted" textStyle="supporting" mt="6">
        Your diary is private and visible only to you.
      </Text>
    </Box>
  );
};

export default Diary;
