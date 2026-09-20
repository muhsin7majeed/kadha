import { Badge, Heading, HStack, Stack } from '@chakra-ui/react';

import type { UpcomingEntry as UpcomingEntryModel } from '@/features/upcoming/upcoming.types';
import { formatUpcomingDate, formatUpcomingRelativeDate } from './upcoming-date';
import UpcomingEntry from './upcoming-entry';

interface UpcomingListProps {
  entries: UpcomingEntryModel[];
  todayDate: string;
}

const UpcomingList = ({ entries, todayDate }: UpcomingListProps) => {
  const entriesByDate = new Map<string, UpcomingEntryModel[]>();

  for (const entry of entries) {
    const datedEntries = entriesByDate.get(entry.date) ?? [];
    datedEntries.push(entry);
    entriesByDate.set(entry.date, datedEntries);
  }

  return (
    <Stack gap="7">
      {[...entriesByDate.entries()].map(([date, datedEntries]) => (
        <Stack as="section" key={date} gap="3" aria-labelledby={`upcoming-${date}`}>
          <HStack gap="2" flexWrap="wrap">
            <Heading id={`upcoming-${date}`} as="h2" textStyle="sectionTitle">
              {formatUpcomingDate(date)}
            </Heading>
            <Badge colorPalette="gray" variant="subtle">
              {formatUpcomingRelativeDate(date, todayDate)}
            </Badge>
          </HStack>
          <Stack gap="3">
            {datedEntries.map((entry) => (
              <UpcomingEntry key={`${entry.kind}:${entry.media.media_type}:${entry.media.media_id}:${entry.date}`} entry={entry} />
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};

export default UpcomingList;
