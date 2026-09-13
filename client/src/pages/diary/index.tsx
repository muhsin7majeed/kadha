import { Alert, Box, Tabs, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { LuBookOpen, LuCalendarDays, LuChartNoAxesColumnIncreasing, LuList } from 'react-icons/lu';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';
import CommonSpinner from '@/components/spinners/common-spinner';
import useDiary from '@/features/user-media/api/use-diary';
import DiaryFilters, { DiaryMediaType } from '@/features/user-media/components/diary-filters';
import DiarySummary from '@/features/user-media/components/diary-summary';
import DiaryTimeline from '@/features/user-media/components/diary-timeline';

export type DiaryTab = 'timeline' | 'calendar' | 'insights';

const Diary = () => {
  const [tab, setTab] = useState<DiaryTab>('timeline');
  const [page, setPage] = useState(1);
  const [mediaType, setMediaType] = useState<DiaryMediaType>('all');
  const [year, setYear] = useState<number>();
  const [month, setMonth] = useState<number>();
  const diary = useDiary({ page, mediaType, year, month: tab === 'timeline' ? month : undefined });

  const resetPage = () => setPage(1);

  return (
    <Box>
      <PageHeader
        isFetching={diary.isFetching}
        subHeader="A private record of each movie watch, rewatch, and TV episode you log."
      >
        Diary
      </PageHeader>

      <Tabs.Root value={tab} onValueChange={(details) => setTab(details.value as DiaryTab)} variant="line">
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
              <Alert.Root status="info">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Calendar is being prepared</Alert.Title>
                  <Alert.Description>Your dated diary entries will appear here by month.</Alert.Description>
                </Alert.Content>
              </Alert.Root>
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
