import { Card, SimpleGrid, Text } from '@chakra-ui/react';

import type { DiarySummary as DiarySummaryData } from '@/features/user-media/user-media.types';

const formatEstimatedTime = (minutes: number) => {
  if (minutes <= 0) return '—';
  if (minutes < 60) return '<1 hour';

  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} hours`;

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours === 0 ? `${days} days` : `${days}d ${remainingHours}h`;
};

const percent = (ratio: number) => `${Math.round(ratio * 100)}%`;

const DiarySummary = ({ summary }: { summary: DiarySummaryData }) => {
  const items = [
    { label: 'Diary entries', value: summary.totalEntries, helper: 'Individual watches' },
    { label: 'Movie watches', value: summary.movieWatches, helper: 'Rewatches included' },
    { label: 'TV episodes', value: summary.episodeWatches, helper: 'Tracked episodes' },
    { label: 'Unique titles', value: summary.uniqueTitles, helper: 'Movies and series' },
    {
      label: 'Estimated time',
      value: formatEstimatedTime(summary.estimatedMinutes),
      helper:
        summary.totalEntries === 0
          ? 'No diary entries yet'
          : `${percent(summary.runtimeCoverage.ratio)} runtime coverage`,
    },
  ];

  return (
    <SimpleGrid columns={{ base: 2, md: 3, xl: 5 }} gap="3">
      {items.map((item) => (
        <Card.Root key={item.label} variant="outline">
          <Card.Body gap="1" p={{ base: '3', md: '4' }}>
            <Text color="fg.muted" textStyle="compactLabel">
              {item.label}
            </Text>
            <Text textStyle="subsectionTitle">{item.value}</Text>
            <Text color="fg.muted" textStyle="supporting">
              {item.helper}
            </Text>
          </Card.Body>
        </Card.Root>
      ))}
    </SimpleGrid>
  );
};

export default DiarySummary;
