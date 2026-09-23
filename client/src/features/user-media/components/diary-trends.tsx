import { Box, Flex, Heading, HStack, Stack, Text } from '@chakra-ui/react';

import type { DiaryMonthBucket } from '@/features/user-media/user-media.types';

const monthNames = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat(undefined, { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, index, 1))),
);

const formatHours = (minutes: number) => {
  if (minutes <= 0) return '—';
  if (minutes < 60) return '<1h';
  return `${Math.round(minutes / 60)}h`;
};

const DiaryTrends = ({ monthly }: { monthly: DiaryMonthBucket[] }) => {
  const maxEntries = Math.max(1, ...monthly.map((bucket) => bucket.totalEntries));
  const maxMinutes = Math.max(1, ...monthly.map((bucket) => bucket.estimatedMinutes));

  return (
    <Stack gap="5">
      <Box as="section" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" bg="bg.panel" p={{ base: '4', md: '5' }}>
        <Stack gap="4">
          <Box>
            <Heading as="h2" textStyle="sectionTitle">
              Watches by month
            </Heading>
            <Text color="fg.muted" textStyle="supporting">
              Movie rewatches and individual episodes each count as one entry.
            </Text>
          </Box>
          <HStack gap="4" textStyle="compactLabel">
            <HStack gap="1.5"><Box boxSize="3" bg="blue.solid" borderRadius="xs" /><Text>Movies</Text></HStack>
            <HStack gap="1.5"><Box boxSize="3" bg="purple.solid" borderRadius="xs" /><Text>Episodes</Text></HStack>
          </HStack>
          <Stack as="ol" listStyleType="none" gap="2">
            {monthly.map((bucket) => {
              const width = (bucket.totalEntries / maxEntries) * 100;
              const movieShare = bucket.totalEntries > 0 ? (bucket.movieWatches / bucket.totalEntries) * 100 : 0;
              return (
                <Flex as="li" key={bucket.month} gap="3" align="center">
                  <Text width="8" textStyle="compactLabel" color="fg.muted">{monthNames[bucket.month - 1]}</Text>
                  <Flex
                    role="img"
                    flex="1"
                    h="5"
                    bg="bg.subtle"
                    borderRadius="sm"
                    overflow="hidden"
                    aria-label={`${monthNames[bucket.month - 1]}: ${bucket.movieWatches} movies and ${bucket.episodeWatches} episodes`}
                  >
                    <Flex aria-hidden width={`${width}%`} minW={bucket.totalEntries > 0 ? '2px' : '0'}>
                      <Box width={`${movieShare}%`} bg="blue.solid" />
                      <Box flex="1" bg="purple.solid" />
                    </Flex>
                  </Flex>
                  <Text width="8" textAlign="end" textStyle="supporting">{bucket.totalEntries}</Text>
                </Flex>
              );
            })}
          </Stack>
        </Stack>
      </Box>

      <Box as="section" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" bg="bg.panel" p={{ base: '4', md: '5' }}>
        <Stack gap="4">
          <Box>
            <Heading as="h2" textStyle="sectionTitle">
              Estimated time by month
            </Heading>
            <Text color="fg.muted" textStyle="supporting">
              Movies use their runtime; episodes use the series’ typical runtime. Missing runtimes are excluded.
            </Text>
          </Box>
          <Stack as="ol" listStyleType="none" gap="2">
            {monthly.map((bucket) => (
              <Flex as="li" key={bucket.month} gap="3" align="center">
                <Text width="8" textStyle="compactLabel" color="fg.muted">{monthNames[bucket.month - 1]}</Text>
                <Box
                  role="img"
                  aria-label={`${monthNames[bucket.month - 1]}: ${formatHours(bucket.estimatedMinutes)} estimated`}
                  flex="1"
                  h="5"
                  bg="bg.subtle"
                  borderRadius="sm"
                  overflow="hidden"
                >
                  <Box
                    aria-hidden
                    h="full"
                    width={`${(bucket.estimatedMinutes / maxMinutes) * 100}%`}
                    minW={bucket.estimatedMinutes > 0 ? '2px' : '0'}
                    bg="teal.solid"
                  />
                </Box>
                <Text width="12" textAlign="end" textStyle="supporting">{formatHours(bucket.estimatedMinutes)}</Text>
              </Flex>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
};

export default DiaryTrends;
