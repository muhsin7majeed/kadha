import { Box, Heading, Stack, Text } from '@chakra-ui/react';

import PaginationControls from '@/components/pagination-controls';
import type { DiaryEntry, DiaryResponse } from '@/features/user-media/user-media.types';
import DiaryEntryItem from './diary-entry';

const groupLabel = (watchedOn: string | null) => {
  if (!watchedOn) return 'Date not recorded';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'full',
  }).format(new Date(`${watchedOn}T00:00:00`));
};

const groupEntries = (entries: DiaryEntry[]) => {
  const groups: Array<{ key: string; label: string; entries: DiaryEntry[] }> = [];

  for (const entry of entries) {
    const key = entry.watchedOn ?? 'undated';
    const latest = groups[groups.length - 1];
    if (latest?.key === key) latest.entries.push(entry);
    else groups.push({ key, label: groupLabel(entry.watchedOn), entries: [entry] });
  }

  return groups;
};

interface DiaryTimelineProps {
  isFetching: boolean;
  onPageChange: (page: number) => void;
  response: DiaryResponse;
}

const DiaryTimeline = ({ isFetching, onPageChange, response }: DiaryTimelineProps) => (
  <Stack gap="6">
    <Box borderLeftWidth="2px" borderColor="border.subtle" pl={{ base: '4', md: '6' }}>
      <Stack gap="7">
        {groupEntries(response.data).map((group) => (
          <Box as="section" key={group.key} position="relative">
            <Box
              aria-hidden
              position="absolute"
              boxSize="2.5"
              borderRadius="full"
              bg={group.key === 'undated' ? 'fg.muted' : 'brand.solid'}
              left={{ base: '-1.28rem', md: '-1.78rem' }}
              top="2"
            />
            <Heading as="h2" textStyle="sectionTitle" mb="3">
              {group.label}
            </Heading>
            {group.key === 'undated' && (
              <Text color="fg.muted" textStyle="supporting" mb="3">
                These entries remain part of your diary but cannot appear in calendar views or date trends.
              </Text>
            )}
            <Stack as="ol" listStyleType="none" gap="3">
              {group.entries.map((entry) => (
                <DiaryEntryItem key={entry.id} entry={entry} />
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>

    <PaginationControls pagination={response.pagination} onPageChange={onPageChange} isDisabled={isFetching} />
  </Stack>
);

export default DiaryTimeline;
