import { Box, Flex, Grid, Heading, HStack, Stack, Text, chakra } from '@chakra-ui/react';

import type { DiaryDayBucket } from '@/features/user-media/user-media.types';

const pad = (value: number) => String(value).padStart(2, '0');
const utcDate = (year: number, month: number, day: number) => {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month, day);
  return date;
};
const dateKey = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
const heatColors = ['bg.subtle', 'brand.subtle', 'brand.muted', 'brand.emphasized', 'brand.solid'];

interface DiaryHeatmapProps {
  daily: DiaryDayBucket[];
  onSelectDate: (date: string) => void;
  year: number;
}

const DiaryHeatmap = ({ daily, onSelectDate, year }: DiaryHeatmapProps) => {
  const buckets = new Map(daily.map((bucket) => [bucket.date, bucket]));
  const maxEntries = Math.max(0, ...daily.map((bucket) => bucket.totalEntries));
  const start = utcDate(year, 0, 1);
  const end = utcDate(year + 1, 0, 1);
  const cells: Array<Date | null> = Array.from({ length: start.getUTCDay() }, () => null);

  for (let date = start; date < end; date = new Date(date.getTime() + 86_400_000)) {
    cells.push(date);
  }

  return (
    <Box as="section" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" bg="bg.panel" p={{ base: '4', md: '5' }}>
      <Stack gap="4">
        <Box>
          <Heading as="h2" textStyle="sectionTitle">
            Viewing days
          </Heading>
          <Text color="fg.muted" textStyle="supporting">
            Each square is one day. Darker squares contain more diary entries—not a score to beat.
          </Text>
        </Box>

        <Box overflowX="auto" pb="2">
          <Flex justify="space-between" minW="46rem" mb="2" color="fg.muted" textStyle="compactLabel">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
              <Text key={month}>{month}</Text>
            ))}
          </Flex>
          <Grid
            role="group"
            aria-label={`${year} viewing activity`}
            templateRows="repeat(7, 0.75rem)"
            gridAutoFlow="column"
            gridAutoColumns="0.75rem"
            gap="1"
            minW="46rem"
          >
            {cells.map((date, index) => {
              if (!date) return <Box key={`blank-${index}`} aria-hidden />;
              const key = dateKey(date);
              const bucket = buckets.get(key);
              const count = bucket?.totalEntries ?? 0;
              const level = count === 0 || maxEntries === 0 ? 0 : Math.max(1, Math.ceil((count / maxEntries) * 4));
              const label = new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeZone: 'UTC' }).format(date);

              if (count === 0) {
                return (
                  <Box
                    key={key}
                    aria-hidden
                    title={`${label}: 0`}
                    boxSize="3"
                    borderRadius="xs"
                    bg={heatColors[0]}
                    borderWidth="1px"
                    borderColor="border.subtle"
                  />
                );
              }

              return (
                <chakra.button
                  type="button"
                  key={key}
                  aria-label={`${label}: ${count} ${count === 1 ? 'watch' : 'watches'}`}
                  title={`${label}: ${count}`}
                  boxSize="3"
                  borderRadius="xs"
                  bg={heatColors[level]}
                  borderWidth="0"
                  borderColor="border.subtle"
                  cursor="pointer"
                  _focusVisible={{ outline: '2px solid', outlineColor: 'brand.focusRing', outlineOffset: '2px' }}
                  onClick={() => onSelectDate(key)}
                />
              );
            })}
          </Grid>
        </Box>

        <HStack justify="flex-end" gap="2" color="fg.muted" textStyle="compactLabel">
          <Text>Fewer</Text>
          {heatColors.map((color) => (
            <Box key={color} boxSize="3" borderRadius="xs" bg={color} borderWidth="1px" borderColor="border.subtle" />
          ))}
          <Text>More</Text>
        </HStack>
      </Stack>
    </Box>
  );
};

export default DiaryHeatmap;
