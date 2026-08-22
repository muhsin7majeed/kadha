import { Flex, SimpleGrid, Stack, Text } from '@chakra-ui/react';

import SimpleAvatar from '@/components/simple-avatar';
import { InsightRankingItem } from '../insights.types';

interface PeopleInsightListProps {
  items: InsightRankingItem[];
  emptyText: string;
}

const PeopleInsightList = ({ items, emptyText }: PeopleInsightListProps) => {
  if (items.length === 0) {
    return (
      <Text color="fg.muted" textStyle="supporting">
        {emptyText}
      </Text>
    );
  }

  return (
    <SimpleGrid as="ol" columns={{ base: 1, sm: 2 }} gap="3" listStyleType="none" m="0" p="0">
      {items.map((item) => (
        <Flex as="li" key={item.id} align="center" gap="3" p="3" borderRadius="lg" bg="bg.subtle">
          <Text color="fg.muted" textStyle="compactLabel" minW="4" aria-hidden="true">
            {item.rank}
          </Text>
          <SimpleAvatar
            src={item.imagePath ? `https://image.tmdb.org/t/p/w185${item.imagePath}` : undefined}
            fallbackName={item.label}
            size="md"
            flexShrink={0}
          />
          <Stack gap="0" minW="0">
            <Text fontWeight="medium" truncate>
              {item.label}
            </Text>
            <Text color="fg.muted" textStyle="supporting">
              {item.value} {item.value === 1 ? 'title' : 'titles'}
            </Text>
          </Stack>
        </Flex>
      ))}
    </SimpleGrid>
  );
};

export default PeopleInsightList;
