import { Box, Flex, Stack, Text } from '@chakra-ui/react';

import { InsightRankingItem } from '../insights.types';

interface RankedInsightListProps {
  items: InsightRankingItem[];
  emptyText: string;
  valueFormatter?: (item: InsightRankingItem) => string;
}

const defaultValueFormatter = (item: InsightRankingItem) => `${item.value} ${item.value === 1 ? 'title' : 'titles'}`;

const RankedInsightList = ({ items, emptyText, valueFormatter = defaultValueFormatter }: RankedInsightListProps) => {
  if (items.length === 0) {
    return (
      <Text color="fg.muted" textStyle="supporting">
        {emptyText}
      </Text>
    );
  }

  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <Stack as="ol" listStyleType="none" gap="3" m="0" p="0">
      {items.map((item) => {
        const formattedValue = valueFormatter(item);

        return (
          <Box
            as="li"
            key={item.id}
            aria-label={`${item.rank}. ${item.label}, ${formattedValue}`}
            position="relative"
            overflow="hidden"
            borderRadius="md"
            bg="bg.subtle"
            minH="11"
          >
            <Box
              aria-hidden="true"
              position="absolute"
              insetY="0"
              insetStart="0"
              width={`${Math.max((item.value / maxValue) * 100, 4)}%`}
              bg="brand.subtle"
            />
            <Flex position="relative" align="center" justify="space-between" gap="3" minH="11" px="3" py="2">
              <Flex align="center" gap="3" minW="0">
                <Text color="fg.muted" textStyle="compactLabel" minW="4" aria-hidden="true">
                  {item.rank}
                </Text>
                <Text fontWeight="medium" truncate>
                  {item.label}
                </Text>
              </Flex>
              <Text flexShrink={0} textStyle="compactLabel">
                {formattedValue}
              </Text>
            </Flex>
          </Box>
        );
      })}
    </Stack>
  );
};

export default RankedInsightList;
